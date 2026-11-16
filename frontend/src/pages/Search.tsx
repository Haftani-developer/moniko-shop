import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../services/api';
import { Category, Product } from '../types';
import { compactFa, normalizeFa } from '../utils/format';
import ProductCard from '../components/ProductCard';

/** امتیاز تطبیق یک محصول با عبارت جستجو؛ ۰ یعنی نامرتبط. */
function score(p: Product, terms: string[], parentName: string): number {
  const fields = {
    name: p.name,
    sub: [p.subtitle, p.brand].filter(Boolean).join(' '),
    cat: [p.category?.name, parentName].filter(Boolean).join(' '),
    other: [p.description, ...(p.specs || []).flatMap((s) => [s.key, s.value])].filter(Boolean).join(' '),
  };
  const norm = {
    name: normalizeFa(fields.name), sub: normalizeFa(fields.sub),
    cat: normalizeFa(fields.cat), other: normalizeFa(fields.other),
  };
  const compact = {
    name: compactFa(fields.name), sub: compactFa(fields.sub),
    cat: compactFa(fields.cat), other: compactFa(fields.other),
  };
  const weights = { name: 10, sub: 6, cat: 4, other: 1 } as const;

  let total = 0;
  for (const t of terms) {
    const ct = t.replace(/\s/g, '');
    let best = 0;
    (Object.keys(weights) as (keyof typeof weights)[]).forEach((k) => {
      if (norm[k].includes(t) || compact[k].includes(ct)) best = Math.max(best, weights[k]);
    });
    if (best === 0) return 0; // همه‌ی کلمات باید جایی پیدا شوند
    total += best;
  }
  return total;
}

export default function Search() {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').trim();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    Promise.all([
      productApi.getAll(),
      productApi.getCategoryTree().catch(() => ({ data: [] as Category[] })), // دسته‌ها اختیاری‌اند
    ])
      .then(([prods, cats]) => {
        if (cancelled) return;
        setProducts(Array.isArray(prods.data) ? prods.data : []);
        setCategories(Array.isArray(cats.data) ? cats.data : []);
      })
      .catch((err) => {
        console.error('خطا در دریافت محصولات برای جستجو:', err);
        if (!cancelled) { setProducts([]); setError(true); }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [attempt]);

  const parentNames = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const results = useMemo(() => {
    const terms = normalizeFa(q).split(' ').filter(Boolean);
    if (terms.length === 0) return products;
    return products
      .map((p) => ({ p, s: score(p, terms, p.category?.parentId ? parentNames.get(p.category.parentId) || '' : '') }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || b.p.id - a.p.id)
      .map((x) => x.p);
  }, [products, q, parentNames]);

  if (loading) return <div className="loading">در حال بارگذاری...</div>;

  if (error) {
    return (
      <div className="kh-container kh-section">
        <p className="kh-muted">دریافت اطلاعات از سرور با مشکل روبه‌رو شد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.</p>
        <button type="button" className="btn" onClick={() => setAttempt((n) => n + 1)}>تلاش دوباره</button>
      </div>
    );
  }

  return (
    <div className="kh-container kh-section">
      <h2 className="kh-title">{q ? `نتایج جستجو برای «${q}»` : 'همه‌ی محصولات'}</h2>
      {q && results.length > 0 && <p className="kh-muted">{new Intl.NumberFormat('fa-IR').format(results.length)} کالا پیدا شد</p>}
      {results.length === 0 ? (
        <p className="kh-muted">محصولی با این مشخصات پیدا نشد. عبارت دیگری را امتحان کنید یا املای کلمات را بررسی کنید.</p>
      ) : (
        <div className="kh-grid">{results.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </div>
  );
}
