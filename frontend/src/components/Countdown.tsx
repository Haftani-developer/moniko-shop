import { useEffect, useState } from 'react';
import { formatNumber } from '../utils/format';

export default function Countdown({ endsAt, onEnd }: { endsAt: string; onEnd?: () => void }) {
  const target = new Date(endsAt).getTime();
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    const t = window.setInterval(() => {
      const l = Math.max(0, target - Date.now());
      setLeft(l);
      if (l === 0) { window.clearInterval(t); onEnd?.(); }
    }, 1000);
    return () => window.clearInterval(t);
  }, [target, onEnd]);

  const total = Math.floor(left / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const box = (n: number) => <span className="kh-cd-box">{n < 10 ? '۰' + formatNumber(n) : formatNumber(n)}</span>;

  return (
    <div className="kh-countdown" dir="ltr" aria-label="زمان باقی‌مانده">
      {box(h)}<b>:</b>{box(m)}<b>:</b>{box(s)}
    </div>
  );
}
