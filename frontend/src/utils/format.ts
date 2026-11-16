const nf = new Intl.NumberFormat('fa-IR');

export const formatNumber = (n: number) => nf.format(n);
export const formatPrice = (n: number) => nf.format(n);

export const discountPercent = (price: number, discountPrice?: number | null) =>
  discountPrice && price > 0 ? Math.round((1 - discountPrice / price) * 100) : 0;

/**
 * یکسان‌سازی متن برای جستجو:
 * ی/ک عربی، همزه و الف‌ها، ة، کشیده، اعراب، نیم‌فاصله، ارقام فارسی/عربی و حروف بزرگ لاتین.
 */
export const normalizeFa = (s: string) =>
  (s || '')
    .replace(/[يىئ]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/[ةۀ]/g, 'ه')
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[\u200c\u200f\u200e]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

/** همان متن بدون هیچ فاصله‌ای (برای تطبیق «میلی‌لیتر» با «میلیلیتر») */
export const compactFa = (s: string) => normalizeFa(s).replace(/\s/g, '');
