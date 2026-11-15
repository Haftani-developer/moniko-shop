import { ReactNode, useRef } from 'react';

/** ردیف افقی قابل اسکرول با دکمه‌های قبلی/بعدی (در موبایل با کشیدن انگشت). */
export default function Carousel({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // در صفحه راست‌به‌چپ، «بعدی» یعنی اسکرول به سمت چپ (مقدار منفی)
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: -dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className={`kh-carousel ${className}`}>
      <button type="button" className="kh-arrow kh-arrow-prev" aria-label="قبلی" onClick={() => scroll(-1)}>›</button>
      <div className="kh-carousel-track" ref={ref}>{children}</div>
      <button type="button" className="kh-arrow kh-arrow-next" aria-label="بعدی" onClick={() => scroll(1)}>‹</button>
    </div>
  );
}
