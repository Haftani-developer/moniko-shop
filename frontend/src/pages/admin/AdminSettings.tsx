import { FormEvent, useEffect, useState } from 'react';
import { adminApi } from '../../services/api';

const FIELDS: { key: string; label: string; ltr?: boolean; area?: boolean; hint?: string }[] = [
  { key: 'topbar_text', label: 'متن نوار بالای سایت (اختیاری)' },
  { key: 'phone1', label: 'تلفن اول', ltr: true },
  { key: 'phone2', label: 'تلفن دوم', ltr: true },
  { key: 'email', label: 'ایمیل', ltr: true },
  { key: 'support_hours', label: 'ساعت پاسخگویی' },
  { key: 'address', label: 'آدرس (اختیاری)' },
  { key: 'instagram', label: 'لینک اینستاگرام', ltr: true, hint: 'با https:// شروع شود' },
  { key: 'telegram', label: 'لینک تلگرام', ltr: true, hint: 'با https:// شروع شود' },
  { key: 'whatsapp', label: 'لینک واتساپ', ltr: true, hint: 'با https:// شروع شود' },
  { key: 'linkedin', label: 'لینک لینکدین', ltr: true, hint: 'با https:// شروع شود' },
  { key: 'about_title', label: 'عنوان متن معرفی (پایین صفحه اصلی)' },
  { key: 'about_text', label: 'متن معرفی', area: true },
  { key: 'copyright', label: 'متن کپی‌رایت فوتر' },
];

export default function AdminSettings() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { adminApi.getSettings().then((r) => setValues(r.data)).catch(() => setError('خطا در دریافت تنظیمات')); }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const r = await adminApi.saveSettings(values);
      setValues(r.data); setMsg('تنظیمات ذخیره شد');
    } catch (err: any) { setError(err.response?.data?.message || 'ذخیره ممکن نشد'); }
  };

  return (
    <div>
      <h2 className="section-title">تنظیمات سایت</h2>
      <p className="admin-hint">فیلدی که خالی بماند، مقدار پیش‌فرض سایت نمایش داده می‌شود (شبکه‌های اجتماعی خالی نمایش داده نمی‌شوند).</p>
      <form className="admin-form" onSubmit={save}>
        <div className="admin-form-row">
          {FIELDS.filter((f) => !f.area).map((f) => (
            <div className="form-group" key={f.key}>
              <label>{f.label}</label>
              <input dir={f.ltr ? 'ltr' : undefined} value={values[f.key] || ''} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
              {f.hint && <small className="admin-hint">{f.hint}</small>}
            </div>
          ))}
        </div>
        {FIELDS.filter((f) => f.area).map((f) => (
          <div className="form-group" key={f.key}>
            <label>{f.label}</label>
            <textarea rows={5} value={values[f.key] || ''} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
          </div>
        ))}
        {error && <div className="error-msg">{error}</div>}
        {msg && <div className="success-msg">{msg}</div>}
        <button className="btn btn-primary">ذخیره تنظیمات</button>
      </form>
    </div>
  );
}
