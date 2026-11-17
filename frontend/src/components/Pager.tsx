const fa = (n: number) => new Intl.NumberFormat('fa-IR').format(n);

interface Props {
  /** صفحه‌ی فعلی از ۰ */
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** صفحه‌بندی ساده: قبلی، چند شماره‌ی اطراف صفحه‌ی فعلی، بعدی */
export default function Pager({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | '…')[] = [];
  const add = (p: number | '…') => { if (pages[pages.length - 1] !== p) pages.push(p); };
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1) add(i);
    else add('…');
  }

  return (
    <nav className="kh-pager" aria-label="صفحه‌بندی">
      <button type="button" disabled={page === 0} onClick={() => onChange(page - 1)}>قبلی</button>
      {pages.map((p, i) => p === '…'
        ? <span key={`gap${i}`} className="kh-pager-gap">…</span>
        : <button key={p} type="button" className={p === page ? 'active' : ''}
                  aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>{fa(p + 1)}</button>)}
      <button type="button" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>بعدی</button>
    </nav>
  );
}
