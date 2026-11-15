import { FormEvent, useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { Brand } from '../../types';
import { getProductImageUrl } from '../../utils/imageUrl';

const empty = { id: 0, name: '', linkUrl: '', sortOrder: '0', active: true };

export default function AdminBrands() {
  const [items, setItems] = useState<Brand[]>([]);
  const [form, setForm] = useState<typeof empty | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => adminApi.getBrands().then((r) => setItems(r.data)).catch(() => setError('خطا در دریافت برندها'));
  useEffect(() => { load(); }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError(''); setSaving(true);
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('linkUrl', form.linkUrl);
    fd.append('sortOrder', form.sortOrder || '0');
    fd.append('active', String(form.active));
    if (file) fd.append('image', file);
    try {
      await adminApi.saveBrand(form.id || null, fd);
      setForm(null); setFile(null); load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'ذخیره برند ممکن نشد');
    } finally { setSaving(false); }
  };

  const remove = async (b: Brand) => {
    if (!window.confirm(`برند «${b.name}» حذف شود؟`)) return;
    await adminApi.deleteBrand(b.id).catch(() => setError('حذف ممکن نشد'));
    load();
  };

  return (
    <div>
      <div className="admin-header-row">
        <h2 className="section-title">برندهای برتر</h2>
        <button className="btn btn-primary" onClick={() => { setForm({ ...empty }); setFile(null); }}>+ برند جدید</button>
      </div>
      {error && <div className="error-msg">{error}</div>}

      {form && (
        <form className="admin-form" onSubmit={save}>
          <div className="admin-form-row">
            <div className="form-group"><label>نام برند</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label>لینک (اختیاری)</label>
              <input dir="ltr" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="/search?q=نام برند" /></div>
            <div className="form-group"><label>ترتیب نمایش</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></div>
          </div>
          <div className="form-group">
            <label>لوگو {form.id ? '(برای تغییر، فایل جدید انتخاب کنید)' : '(الزامی؛ ترجیحاً PNG شفاف)'}</label>
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
        <thead><tr><th>لوگو</th><th>نام</th><th>لینک</th><th>ترتیب</th><th>وضعیت</th><th></th></tr></thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td><img src={getProductImageUrl(b.imageUrl)} alt="" style={{ width: 80, height: 36, objectFit: 'contain' }} /></td>
              <td>{b.name}</td><td dir="ltr">{b.linkUrl}</td><td>{b.sortOrder}</td><td>{b.active ? 'فعال' : 'مخفی'}</td>
              <td>
                <button className="btn" onClick={() => { setForm({ id: b.id, name: b.name, linkUrl: b.linkUrl || '', sortOrder: String(b.sortOrder), active: b.active }); setFile(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>ویرایش</button>{' '}
                <button className="btn" onClick={() => remove(b)}>حذف</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6}>هنوز برندی ثبت نشده است.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
