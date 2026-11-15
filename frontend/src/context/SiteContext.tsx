import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { homeApi } from '../services/api';
import { HomeData } from '../types';

interface SiteContextType {
  data: HomeData | null;
  loading: boolean;
}

const SiteContext = createContext<SiteContextType>({ data: null, loading: true });

/** محتوای قابل مدیریت صفحه اصلی (بنرها، برندها، تنظیمات، حراج و منتخب‌ها) یک بار گرفته می‌شود. */
export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    homeApi.get()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return <SiteContext.Provider value={{ data, loading }}>{children}</SiteContext.Provider>;
};

export const useSite = () => useContext(SiteContext);

/** مقدار یک تنظیم سایت؛ اگر مدیر چیزی ثبت نکرده باشد مقدار پیش‌فرض برمی‌گردد. */
export const useSetting = (key: string, fallback = '') => {
  const { data } = useSite();
  const v = data?.settings?.[key];
  return v && v.trim() ? v : fallback;
};
