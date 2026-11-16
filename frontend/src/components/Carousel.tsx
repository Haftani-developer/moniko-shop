import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

/** فلش با SVG (کاراکترهای ‹ › در صفحه راست‌به‌چپ خودکار برعکس نمایش داده می‌شوند). */
export const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === 'right' ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} />
  </svg>
);

/** ردیف افقی قابل اسکرول؛ دکمه‌ها فقط وقتی نشان داده می‌شوند که در آن جهت چیزی برای دیدن باشد. */
export default function Carousel({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // در RTL مقدار منفی است
    setAtStart(pos < 4);
    setAtEnd(max <= 4 || pos > max - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    Array.from(el.children).forEach((c) => ro?.observe(c));
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      ro?.disconnect();
    };
  }, [update, children]);

  // راست‌به‌چپ: «بعدی» یعنی رفتن به چپ (مقدار منفی)
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: -dir * Math.max(200, el.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <div className={`kh-carousel ${className}`}>
      {!atStart && <button type="button" className="kh-arrow kh-arrow-prev" aria-label="قبلی" onClick={() => scroll(-1)}><Chevron dir="right" /></button>}
      <div className="kh-carousel-track" ref={ref}>{children}</div>
      {!atEnd && <button type="button" className="kh-arrow kh-arrow-next" aria-label="بعدی" onClick={() => scroll(1)}><Chevron dir="left" /></button>}
    </div>
  );
}
