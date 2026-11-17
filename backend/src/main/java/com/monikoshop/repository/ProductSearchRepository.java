package com.monikoshop.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * جستجو و صفحه‌بندی محصولات با SQL native (روی ستون search_text).
 * همه‌ی مقادیر کاربر فقط به‌صورت پارامتر بسته می‌شوند؛ هیچ ورودی کاربری وارد متن SQL نمی‌شود.
 */
@Repository
public class ProductSearchRepository {

    public record Result(List<Long> ids, long total) { }

    /** قیمت نهایی: قیمت با تخفیف اگر مثبت باشد، وگرنه قیمت اصلی (هم‌رفتار با فرانت‌اند). */
    private static final String EFFECTIVE_PRICE =
            "(CASE WHEN p.discount_price IS NOT NULL AND p.discount_price > 0 THEN p.discount_price ELSE p.price END)";

    @PersistenceContext
    private EntityManager em;

    /**
     * @param terms        کلمات نرمال‌شده (همه باید در search_text باشند)
     * @param categorySlug اسلاگ دسته (شامل همه‌ی زیردسته‌ها) یا null
     * @param sort         relevance | new | cheap | expensive | discount
     */
    public Result search(List<String> terms, String categorySlug, boolean inStockOnly,
                         String sort, int page, int size) {
        Map<String, Object> params = new LinkedHashMap<>();
        StringBuilder where = new StringBuilder(" FROM products p WHERE p.active = TRUE");
        String cte = "";

        if (categorySlug != null) {
            cte = "WITH RECURSIVE cat_tree(id) AS ("
                    + "SELECT id FROM categories WHERE slug = :slug "
                    + "UNION SELECT c.id FROM categories c JOIN cat_tree t ON c.parent_id = t.id) ";
            where.append(" AND p.category_id IN (SELECT id FROM cat_tree)");
            params.put("slug", categorySlug);
        }
        if (inStockOnly) {
            where.append(" AND p.stock > 0");
        }
        for (int i = 0; i < terms.size(); i++) {
            where.append(" AND p.search_text LIKE :t").append(i);
            params.put("t" + i, "%" + terms.get(i) + "%");
        }

        String orderBy;
        switch (sort == null ? "" : sort) {
            case "cheap" -> orderBy = EFFECTIVE_PRICE + " ASC, p.id DESC";
            case "expensive" -> orderBy = EFFECTIVE_PRICE + " DESC, p.id DESC";
            case "discount" -> orderBy = "(CASE WHEN " + EFFECTIVE_PRICE + " < p.price THEN (p.price - "
                    + EFFECTIVE_PRICE + ") / p.price ELSE 0 END) DESC, p.id DESC";
            case "relevance" -> {
                if (terms.isEmpty()) {
                    orderBy = "p.id DESC";
                } else {
                    // نام محصول ابتدای search_text است؛ هرچه اولین کلمه زودتر بیاید مرتبط‌تر است
                    orderBy = "strpos(p.search_text, :rel) ASC, p.id DESC";
                    params.put("rel", terms.get(0));
                }
            }
            default -> orderBy = "p.id DESC";
        }

        Query count = em.createNativeQuery(cte + "SELECT COUNT(*)" + where);
        bind(count, params, false);
        long total = ((Number) count.getSingleResult()).longValue();

        List<Long> ids = new ArrayList<>();
        if (total > 0) {
            Query q = em.createNativeQuery(cte + "SELECT p.id" + where + " ORDER BY " + orderBy);
            bind(q, params, true);
            q.setFirstResult(page * size);
            q.setMaxResults(size);
            for (Object row : q.getResultList()) {
                ids.add(((Number) row).longValue());
            }
        }
        return new Result(ids, total);
    }

    /** شناسه‌ی همه‌ی محصولات فعال (برای sitemap). */
    public List<Long> activeProductIds() {
        List<Long> ids = new ArrayList<>();
        for (Object row : em.createNativeQuery("SELECT id FROM products WHERE active = TRUE ORDER BY id").getResultList()) {
            ids.add(((Number) row).longValue());
        }
        return ids;
    }

    /** تعداد محصولاتی که هنوز search_text ندارند (قبل از مهاجرت V2 ساخته شده‌اند). */
    public long countMissingSearchText() {
        return ((Number) em.createNativeQuery("SELECT COUNT(*) FROM products WHERE search_text IS NULL")
                .getSingleResult()).longValue();
    }

    private static void bind(Query q, Map<String, Object> params, boolean includeRel) {
        for (Map.Entry<String, Object> e : params.entrySet()) {
            if (!includeRel && e.getKey().equals("rel")) {
                continue; // پارامتر rel فقط در ORDER BY استفاده می‌شود، نه در COUNT
            }
            q.setParameter(e.getKey(), e.getValue());
        }
    }
}
