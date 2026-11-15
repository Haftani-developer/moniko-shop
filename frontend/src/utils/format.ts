const nf = new Intl.NumberFormat('fa-IR');

export const formatNumber = (n: number) => nf.format(n);
export const formatPrice = (n: number) => nf.format(n);

export const discountPercent = (price: number, discountPrice?: number | null) =>
  discountPrice && price > 0 ? Math.round((1 - discountPrice / price) * 100) : 0;

/** یکسان‌سازی حروف عربی/فارسی برای جستجو */
export const normalizeFa = (s: string) =>
  (s || '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u064B-\u065F\u200c]/g, '')
    .toLowerCase();
