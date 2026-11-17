import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Pager from '../components/Pager';
import { useListingParams, useProductList } from '../utils/useProductList';
import { SITE_NAME, useSeo } from '../utils/seo';

const PAGE_SIZE = 24;
const fa = (n: number) => new Intl.NumberFormat('fa-IR').format(n);

/** جستجو روی سرور (نام، برند، دسته و دسته‌ی والد، توضیحات، مشخصات) با صفحه‌بندی */
export default function Search() {
  const [sp] = useSearchParams();
  const q = (sp.get('q') || '').trim();
  const { sort, inStock, page, update } = useListingParams();

  const { data, loading, error, retry } = useProductList({
    q, sort: sort || undefined, inStock, page, size: PAGE_SIZE,
  });

  // صفحه‌ی نتایج جستجو محتوای تکراری است؛ ایندکس نشود
  useSeo({ title: q ? `جستجوی «${q}» | ${SITE_NAME}` : `همه‌ی محصولات | ${SITE_NAME}`, noindex: true });

  if (loading && !data) return <div className="loading">در حال بارگذاری...</div>;

  if (error) {
    return (
      <div className="kh-container kh-section">
        <p className="kh-muted">دریافت اطلاعات از سرور با مشکل روبه‌رو شد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.</p>
        <button type="button" className="btn" onClick={retry}>تلاش دوباره</button>
      </div>
    );
  }

  const items = data?.items ?? [];
  const total = data?.totalItems ?? 0;

  return (
    <div className="kh-container kh-section">
      <div className="kh-listing-bar">
        <h2 className="kh-title">{q ? `نتایج جستجو برای «${q}»` : 'همه‌ی محصولات'}</h2>
        <div className="kh-listing-tools">
          <label className="kh-check">
            <input type="checkbox" checked={inStock} onChange={(e) => update({ inStock: e.target.checked ? '1' : null })} /> فقط کالاهای موجود
          </label>
          <select value={sort} onChange={(e) => update({ sort: e.target.value })} aria-label="مرتب‌سازی">
            <option value="">{q ? 'مرتبط‌ترین' : 'جدیدترین'}</option>
            {q && <option value="new">جدیدترین</option>}
            <option value="discount">بیشترین تخفیف</option>
            <option value="cheap">ارزان‌ترین</option>
            <option value="expensive">گران‌ترین</option>
          </select>
        </div>
      </div>
      {total > 0 && <p className="kh-muted">{fa(total)} کالا پیدا شد</p>}
      {items.length === 0 ? (
        <p className="kh-muted">محصولی با این مشخصات پیدا نشد. عبارت دیگری را امتحان کنید یا املای کلمات را بررسی کنید.</p>
      ) : (
        <div className={`kh-grid${loading ? ' kh-listing-busy' : ''}`}>
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
      <Pager page={page} totalPages={data?.totalPages ?? 0}
             onChange={(p) => { update({ page: String(p + 1) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
    </div>
  );
}
