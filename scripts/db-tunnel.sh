#!/usr/bin/env bash
# Otevře tunel na produkční Postgres, který na Hetzneru běží bez
# publikovaného portu (a záměrně tam žádný nechceme).
#
#   ./scripts/db-tunnel.sh                # tunel na 127.0.0.1:5433
#   DATABASE_URL=postgres://…@127.0.0.1:5433/… bun run migrate
#
# Lokální port je 5433, aby nekolidoval s Postgresem z docker-compose.yml.
#
# Vyžaduje: SSH alias `hetzner-coolify` a jméno kontejneru databáze
# (Coolify > Databases > … > Container name).

set -euo pipefail

SSH_HOST="${SSH_HOST:-hetzner-coolify}"
LOCAL_PORT="${LOCAL_PORT:-5433}"
PG_CONTAINER="${PG_CONTAINER:-}"

if [ -z "$PG_CONTAINER" ]; then
  echo "Nastav PG_CONTAINER na jméno kontejneru s Postgresem." >&2
  echo "Nabídka na serveru:" >&2
  ssh "$SSH_HOST" "docker ps --filter ancestor=postgres:17-alpine --format '  {{.Names}}'" >&2
  exit 1
fi

PG_IP=$(ssh "$SSH_HOST" \
  "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $PG_CONTAINER")

if [ -z "$PG_IP" ]; then
  echo "Kontejner $PG_CONTAINER nemá IP — běží?" >&2
  exit 1
fi

echo "Tunel 127.0.0.1:$LOCAL_PORT -> $PG_CONTAINER ($PG_IP:5432)"
echo "Ukončíš Ctrl+C."
exec ssh -N -o ExitOnForwardFailure=yes -L "$LOCAL_PORT:$PG_IP:5432" "$SSH_HOST"
