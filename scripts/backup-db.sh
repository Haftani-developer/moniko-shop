#!/bin/sh
# بکاپ فشرده‌ی PostgreSQL با چرخش خودکار (حذف بکاپ‌های قدیمی‌تر از N روز).
#
# استفاده (با متغیرهای استاندارد PostgreSQL):
#   PGHOST=... PGPORT=5432 PGUSER=... PGPASSWORD=... PGDATABASE=monikoshop \
#   BACKUP_DIR=./backups BACKUP_KEEP_DAYS=14 ./scripts/backup-db.sh
#
# با docker compose محلی:  docker compose --profile backup up -d db-backup   (هر ۲۴ ساعت)
# بکاپ را حتماً روی یک «جای دیگر» هم کپی کنید (دیسک دیگر/فضای ابری)؛ بکاپِ هم‌دیسکِ دیتابیس کافی نیست.
set -eu

DB="${PGDATABASE:-monikoshop}"
DIR="${1:-${BACKUP_DIR:-./backups}}"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"

mkdir -p "$DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
SQL="$DIR/$DB-$STAMP.sql"

cleanup() { rm -f "$SQL" "$SQL.gz.partial"; }
trap cleanup EXIT

# --clean --if-exists: فایل خروجی هنگام ریستور اشیای قبلی را پاک و دوباره می‌سازد
pg_dump --no-owner --no-privileges --clean --if-exists -f "$SQL" "$DB"
gzip -9 -c "$SQL" > "$SQL.gz.partial"
gzip -t "$SQL.gz.partial"                 # سالم بودن فایل فشرده
mv "$SQL.gz.partial" "$SQL.gz"

find "$DIR" -maxdepth 1 -name "$DB-*.sql.gz" -mtime "+$KEEP_DAYS" -delete
echo "Backup OK: $SQL.gz ($(du -h "$SQL.gz" | cut -f1))"
