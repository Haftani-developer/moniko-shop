import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi, ProductSearchParams } from '../services/api';
import { PagedProducts } from '../types';

interface ListState { data: PagedProducts | null; loading: boolean; error: boolean; notFound: boolean }

/** دریافت یک صفحه از محصولات از سرور؛ با تغییر پارامترها دوباره دریافت می‌شود. */
export function useProductList(params: ProductSearchParams) {
  const key = JSON.stringify(params);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ListState>({ data: null, loading: true, error: false, notFound: false });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: false, notFound: false }));
    productApi.search(params)
      .then((res) => { if (!cancelled) setState({ data: res.data as PagedProducts, loading: false, error: false, notFound: false }); })
      .catch((err) => {
        if (cancelled) return;
        const notFound = err?.response?.status === 404;
        if (!notFound) console.error('خطا در دریافت لیست محصولات:', err);
        setState({ data: null, loading: false, error: !notFound, notFound });
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  return { ...state, retry: () => setAttempt((n) => n + 1) };
}

export type SortKey = 'new' | 'cheap' | 'expensive' | 'discount' | 'relevance';

/** مرتب‌سازی، فیلتر موجودی و صفحه را در آدرس نگه می‌دارد (قابل اشتراک‌گذاری و با دکمه‌ی برگشت سازگار). */
export function useListingParams() {
  const [params, setParams] = useSearchParams();
  const sort = params.get('sort') || '';
  const inStock = params.get('inStock') === '1';
  const page = Math.max(0, (parseInt(params.get('page') || '1', 10) || 1) - 1); // در آدرس از ۱ شروع می‌شود

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v === null || v === '' ? next.delete(k) : next.set(k, v)));
    if (!('page' in patch)) next.delete('page'); // با تغییر فیلتر به صفحه‌ی اول برگرد
    setParams(next);
  };

  return { params, sort, inStock, page, update };
}
