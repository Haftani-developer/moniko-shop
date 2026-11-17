package com.monikoshop.dto;

import java.util.List;

/**
 * یک صفحه از نتایج محصولات (page از ۰ شروع می‌شود).
 * categoryName فقط وقتی پر است که جستجو روی یک دسته فیلتر شده باشد.
 */
public record PagedProducts(
        List<ProductResponse> items,
        int page,
        int size,
        long totalItems,
        int totalPages,
        String categoryName
) {
    public PagedProducts withCategoryName(String name) {
        return new PagedProducts(items, page, size, totalItems, totalPages, name);
    }
}
