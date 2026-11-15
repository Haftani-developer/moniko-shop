import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productApi } from '../services/api';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

type Sort = 'new' | 'cheap' | 'expensive' | 'discount';

const effective = (p: Product) => p.discountPrice || p.price;

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sort, setSort] = useState<Sort>('new');
  const [onlyStock, setOnlyStock] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    productApi.getByCategory(slug)
      .then((res) => setProducts(res.data))
      .catch((err) => { if (err.response?.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading">در حال بارگذاری...</div>;

  if (notFound) {
    return (
      <div className="kh-container kh-section">
        <p>دسته‌بندی مورد نظر یافت نشد.</p>
        <Link to="/">بازگشت به صفحه اصلی</Link>
      </div>
    );
  }

  const list = products
    .filter((p) => !onlyStock || p.stock > 0)
    .sort((a, b) => {
      switch (sort) {
        case 'cheap': return effective(a) - effective(b);
        case 'expensive': return effective(b) - effective(a);
        case 'discount': return (b.discountPrice ? 1 - b.discountPrice / b.price : 0) - (a.discountPrice ? 1 - a.discountPrice / a.price : 0);
        default: return b.id - a.id;
      }
    });

  return (
    <div className="kh-container kh-section">
      <nav className="kh-breadcrumb"><Link to="/">خانه</Link> ‹ <span>محصولات دسته‌بندی</span></nav>
      <div className="kh-listing-bar">
        <h2 className="kh-title">محصولات</h2>
        <div className="kh-listing-tools">
          <label className="kh-check">
            <input type="checkbox" checked={onlyStock} onChange={(e) => setOnlyStock(e.target.checked)} /> فقط کالاهای موجود
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="مرتب‌سازی">
            <option value="new">جدیدترین</option>
            <option value="discount">بیشترین تخفیف</option>
            <option value="cheap">ارزان‌ترین</option>
            <option value="expensive">گران‌ترین</option>
          </select>
        </div>
      </div>
      {list.length === 0 ? (
        <p className="kh-muted">محصولی در این دسته‌بندی یافت نشد.</p>
      ) : (
        <div className="kh-grid">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </div>
  );
}
