import { FormEvent, useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { Banner } from '../../types';
import { getProductImageUrl } from '../../utils/imageUrl';

const POSITIONS: Record<string, string> = {
  HERO: 'اسلایدر اصلی (بالای صفحه)',
  MID1: 'ردیف بنر اول (زیر دسته‌ها)',
  MID2: 'ردیف بنر دوم (بعد از حراج)',
};
const HINTS: Record<string, string> = {
  HERO: 'اندازه پیشنهادی: ۱۶۰۰×۵۰۰ پیکسل',
  MID1: 'اندازه پیشنهادی: ۸۰۰×۳۰۰ پیکسل',
  MID2: 'اندازه پیشنهادی: ۸۰۰×۳۰۰ پیکسل',
};

const empty = { id: 0, position: 'HERO', title: '', linkUrl: '', sortOrder: '0', active: true };

export default function AdminBanners() {
  const [items, setItems] = useState<Banner[]>([]);
  const [form, setForm] = useState<typeof empty | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => adminApi.getBanners().then((r) => setItems(r.data)).catch(() => setError('خطا در دریافت بنرها'));
  useEffect(() => { load(); }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError(''); setSaving(true);
    const fd = new FormData();
    fd.append('position', form.position);
    fd.append('title', form.title);
    fd.append('linkUrl', form.linkUrl);
    fd.append('sortOrder', form.sortOrder || '0');
    fd.append('active', String(form.active));
    if (file) fd.append('image', file);
    try {
      await adminApi.saveBanner(form.id || null, fd);
      setForm(null); setFile(null); load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'ذخیره بنر ممکن نشد');
    } finally { setSaving(false); }
  };

  const remove = async (b: Banner) => {
    if (!window.confirm('این بنر حذف شود؟')) return;
    await adminApi.deleteBanner(b.id).catch(() => setError('حذف ممکن نشد'));
    load();
  };

  return (
    <div>
      <div className="admin-header-row">
        <h2 className="section-title">بنرهای صفحه اصلی</h2>
        <button className="btn btn-primary" onClick={() => { setForm({ ...empty }); setFile(null); }}>+ بنر جدید</button>
      </div>
      {error && <div className="error-msg">{error}</div>}

      {form && (
        <form className="admin-form" onSubmit={save}>
          <div className="admin-form-row">
            <div className="form-group">
              <label>جایگاه</label>
              <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                {Object.entries(POSITIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <small className="admin-hint">{HINTS[form.position]}</small>
            </div>
            <div className="form-group">
              <label>عنوان (برای متن جایگزین)</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>لینک (مثلاً /categories/skin یا https://...)</label>
              <input dir="ltr" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
            </div>
            <div className="form-group">
              <label>ترتیب نمایش</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>تصویر {form.id ? '(برای تغییر، فایل جدید انتخاب کنید)' : '(الزامی)'}</label>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <label className="admin-check"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> نمایش در سایت</label>
          <div className="admin-form-actions">
            <button className="btn btn-primary" disabled={saving}>{saving ? 'در حال ذخیره...' : 'ذخیره'}</button>
            <button type="button" className="btn" onClick={() => setForm(null)}>انصراف</button>
          </div>
        </form>
      )}

      <table className="admin-table">
        <thead><tr><th>تصویر</th><th>جایگاه</th><th>عنوان</th><th>لینک</th><th>ترتیب</th><th>وضعیت</th><th></th></tr></thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td><img src={getProductImageUrl(b.imageUrl)} alt="" style={{ width: 110, height: 44, objectFit: 'cover', borderRadius: 6 }} /></td>
              <td>{POSITIONS[b.position]}</td>
              <td>{b.title}</td>
              <td dir="ltr">{b.linkUrl}</td>
              <td>{b.sortOrder}</td>
              <td>{b.active ? 'فعال' : 'مخفی'}</td>
              <td>
                <button className="btn" onClick={() => { setForm({ id: b.id, position: b.position, title: b.title || '', linkUrl: b.linkUrl || '', sortOrder: String(b.sortOrder), active: b.active }); setFile(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>ویرایش</button>{' '}
                <button className="btn" onClick={() => remove(b)}>حذف</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={7}>هنوز بنری ثبت نشده است.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
