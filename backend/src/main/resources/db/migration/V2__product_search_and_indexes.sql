-- ============================================================================
-- V2: جستجوی سمت سرور + ایندکس‌های کاربردی
-- ============================================================================

-- متن نرمال‌شده‌ی قابل جستجو (نام، برند، دسته، مشخصات، ...). توسط برنامه پر می‌شود
-- (SearchTextNormalizer) و در شروع برنامه برای محصولات قدیمی بازسازی می‌شود.
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_text TEXT;

-- ایندکس‌های ساده برای لیست محصولات، سفارش‌ها و درخت دسته‌ها
CREATE INDEX IF NOT EXISTS idx_products_active_id ON products (active, id DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories (parent_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);

-- ایندکس trigram برای LIKE '%...%' سریع روی search_text.
-- اگر دیتابیس اجازه‌ی ساخت extension ندهد، مهاجرت شکست نمی‌خورد؛ جستجو فقط
-- بدون ایندکس (sequential scan) کار می‌کند که برای چند هزار محصول هم سریع است.
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE INDEX IF NOT EXISTS idx_products_search_trgm ON products USING gin (search_text gin_trgm_ops);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_trgm در دسترس نیست؛ جستجو بدون ایندکس trigram اجرا می‌شود: %', SQLERRM;
END
$$;
