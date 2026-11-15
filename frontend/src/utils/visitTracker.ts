import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const KEY = 'moniko_visitor_id';
const INTERVAL_MS = 20_000;

/** شناسه‌ی تصادفی و ناشناس این مرورگر (بدون اطلاعات شخصی). */
function getVisitorId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // localStorage بسته است (مثلاً حالت خصوصی): برای همین صفحه یک شناسه‌ی موقت
    return crypto.randomUUID();
  }
}

const sessionFallbackId = getVisitorId();

/**
 * هر ۲۰ ثانیه (فقط وقتی تب دیده می‌شود) یک heartbeat می‌فرستد.
 * بک‌اند از روی توکن می‌فهمد کاربر است یا مهمان.
 */
export function useVisitTracker() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    const visitorId = sessionFallbackId;
    const beat = () => {
      if (document.visibilityState !== 'visible') return;
      api.post('/track/heartbeat', { visitorId }).catch(() => { /* بی‌صدا */ });
    };

    beat();
    const timer = window.setInterval(beat, INTERVAL_MS);
    document.addEventListener('visibilitychange', beat);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', beat);
    };
    // با لاگین/خروج دوباره اجرا می‌شود تا مهمان ← کاربر سریع ثبت شود
  }, [userId]);
}
