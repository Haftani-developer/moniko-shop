import { describe, expect, it } from 'vitest';
import { compactFa, normalizeFa } from './format';

const hay = normalizeFa('کرم مرطوب کننده ۵۰ میلی‌لیتر نیوآ');
const compactHay = compactFa('کرم مرطوب کننده ۵۰ میلی‌لیتر نیوآ');
const matches = (q: string) =>
  normalizeFa(q).split(' ').filter(Boolean).every((t) => hay.includes(t) || compactHay.includes(t));

describe('normalizeFa', () => {
  it('ارقام فارسی، عربی و لاتین را یکی می‌کند', () => {
    expect(normalizeFa('۵۰')).toBe('50');
    expect(normalizeFa('٥٠')).toBe('50');
    expect(matches('50 میلی')).toBe(true);
  });

  it('نیم‌فاصله و غیاب فاصله هر دو پیدا می‌شوند', () => {
    expect(matches('مرطوب‌کننده')).toBe(true);
    expect(matches('مرطوبکننده')).toBe(true);
    expect(matches('میلیلیتر')).toBe(true);
  });

  it('حروف عربی و انواع الف را یکی می‌کند', () => {
    expect(normalizeFa('كرم')).toBe('کرم');
    expect(normalizeFa('ايران')).toBe('ایران');
    expect(matches('نیوا')).toBe(true);
  });

  it('علائم نگارشی را به فاصله تبدیل و فاصله‌ها را فشرده می‌کند', () => {
    expect(normalizeFa('  a%b_c   x ')).toBe('a b c x');
  });

  it('ورودی خالی امن است', () => {
    expect(normalizeFa('')).toBe('');
    expect(normalizeFa(undefined as unknown as string)).toBe('');
  });
});

describe('compactFa', () => {
  it('همه‌ی فاصله‌ها را برمی‌دارد', () => {
    expect(compactFa('میلی‌لیتر 50')).toBe('میلیلیتر50');
  });
});
