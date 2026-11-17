#!/bin/sh
# بازگردانی بکاپ در PostgreSQL. ⚠️ اشیای فعلی دیتابیس را پاک و با بکاپ جایگزین می‌کند.
#
#   PGHOST=... PGUSER=... PGPASSWORD=... PGDATABASE=monikoshop \
#   ./scripts/restore-db.sh backups/monikoshop-20260101-030000.sql.gz --yes
#
# قبل از ریستور روی production، بک‌اند را متوقف کنید.
set -eu

FILE="${1:-}"
DB="${PGDATABASE:-monikoshop}"

if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "استفاده: $0 <backup.sql.gz> --yes" >&2
  exit 2
fi
if [ "${2:-}" != "--yes" ]; then
  echo "این کار دیتابیس '$DB' را با محتوای $FILE جایگزین می‌کند." >&2
  echo "اگر مطمئنید دوباره با --yes اجرا کنید." >&2
  exit 1
fi

gzip -t "$FILE"
gunzip -c "$FILE" | psql -v ON_ERROR_STOP=1 -q -o /dev/null "$DB"
echo "Restore OK: $FILE -> $DB"
