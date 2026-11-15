import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../services/api';
import { Product } from '../types';
import { normalizeFa } from '../utils/format';
import ProductCard from '../components/ProductCard';

export default function Search() {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').trim();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.getAll()
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">در حال بارگذاری...</div>;

  const terms = normalizeFa(q).split(/\s+/).filter(Boolean);
  const results = products.filter((p) => {
    if (terms.length === 0) return true;
    const hay = normalizeFa([p.name, p.subtitle, p.brand, p.category?.name].filter(Boolean).join(' '));
    return terms.every((t) => hay.includes(t));
  });

  return (
    <div className="kh-container kh-section">
      <h2 className="kh-title">{q ? `نتایج جستجو برای «${q}»` : 'همه‌ی محصولات'}</h2>
      {results.length === 0 ? (
        <p className="kh-muted">محصولی با این مشخصات پیدا نشد.</p>
      ) : (
        <div className="kh-grid">{results.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </div>
  );
}
