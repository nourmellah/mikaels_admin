#!/bin/bash
set -euo pipefail

echo "[entrypoint] Starting…"
echo "[entrypoint] PGDATA=$PGDATA"

mkdir -p "$PGDATA"
chown -R postgres:postgres "$PGDATA"

# find Postgres binaries (works on postgres:16-bookworm)
BIN_DIR="$(dirname "$(command -v postgres)")"
INITDB="$BIN_DIR/initdb"
PG_ISREADY="$BIN_DIR/pg_isready"

echo "[entrypoint] Using BIN_DIR=$BIN_DIR"
if [ ! -x "$INITDB" ]; then
  echo "[entrypoint] FATAL: initdb not found at $INITDB"; exit 1
fi

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  echo "[entrypoint] Initializing cluster…"
  su -s /bin/bash postgres -c "$INITDB -D '$PGDATA'"
  echo "listen_addresses = '127.0.0.1'" >> "$PGDATA/postgresql.conf"
  echo "port = 5432" >> "$PGDATA/postgresql.conf"
  echo "host all all 127.0.0.1/32 trust" >> "$PGDATA/pg_hba.conf"
else
  echo "[entrypoint] Cluster already initialized."
fi

echo "[entrypoint] Launching supervisord…"
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
