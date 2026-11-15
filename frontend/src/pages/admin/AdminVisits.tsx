import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { VisitStats } from '../../types';

const nf = new Intl.NumberFormat('fa-IR');
const fmtDate = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });

export default function AdminVisits() {
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    const load = () =>
      adminApi.getVisits()
        .then((res) => { if (alive) { setStats(res.data); setError(''); } })
        .catch(() => { if (alive) setError('خطا در دریافت آمار بازدید'); });
    load();
    const t = window.setInterval(load, 10_000); // آنلاین‌ها هر ۱۰ ثانیه تازه می‌شوند
    return () => { alive = false; window.clearInterval(t); };
  }, []);

  if (!stats) return error ? <div className="error-msg">{error}</div> : <div className="loading">در حال بارگذاری...</div>;

  const max = Math.max(1, stats.today.total, ...stats.history.map((d) => d.total));

  return (
    <div>
      <h2 className="section-title">آمار بازدید</h2>
      {error && <div className="error-msg">{error}</div>}

      <h4 className="visit-sub">
        <span className="live-dot" /> همین الان آنلاین
      </h4>
      <div className="stat-cards">
        <div className="stat-card live"><b>{nf.format(stats.online.total)}</b><span>کل</span></div>
        <div className="stat-card"><b>{nf.format(stats.online.users)}</b><span>کاربر (وارد شده)</span></div>
        <div className="stat-card"><b>{nf.format(stats.online.guests)}</b><span>مهمان</span></div>
      </div>

      <h4 className="visit-sub">امروز ({fmtDate(stats.today.date)})</h4>
      <div className="stat-cards">
        <div className="stat-card"><b>{nf.format(stats.today.total)}</b><span>بازدیدکننده‌ی یکتا</span></div>
        <div className="stat-card"><b>{nf.format(stats.today.users)}</b><span>کاربر (وارد شده)</span></div>
        <div className="stat-card"><b>{nf.format(stats.today.guests)}</b><span>مهمان</span></div>
      </div>
      <p className="visit-note">
        هر مرورگر یک بار در روز شمرده می‌شود. اگر مهمانِ امروز بعداً وارد حساب شود، همان روز «کاربر» حساب می‌شود.
        عدد نهایی هر روز بعد از نیمه‌شب (به وقت تهران) در دیتابیس ذخیره می‌شود.
      </p>

      <h4 className="visit-sub">روزهای قبل (ذخیره‌شده در دیتابیس)</h4>
      {stats.history.length === 0 ? (
        <p className="visit-note">هنوز روزی ذخیره نشده؛ اولین عدد نهایی بعد از نیمه‌شب ثبت می‌شود.</p>
      ) : (
        <table className="admin-table">
          <thead><tr><th>تاریخ</th><th>کل</th><th>کاربر</th><th>مهمان</th><th></th></tr></thead>
          <tbody>
            {stats.history.map((d) => (
              <tr key={d.date}>
                <td>{fmtDate(d.date)}</td>
                <td>{nf.format(d.total)}</td>
                <td>{nf.format(d.users)}</td>
                <td>{nf.format(d.guests)}</td>
                <td style={{ width: '30%' }}>
                  <div className="visit-bar"><div style={{ width: `${(d.total / max) * 100}%` }} /></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
