#!/bin/sh
set -eu

if [ -z "${1:-}" ]; then
  echo "usage: pnpm db:backup <env-file> [out-file]" >&2
  exit 1
fi

env_file="$1"

if [ ! -f "$env_file" ]; then
  echo "env file not found: $env_file" >&2
  exit 1
fi

db_url="$(sed -n 's/^PG_CONNECTION_STRING=//p' "$env_file" | tail -n 1 | tr -d "\"'")"

if [ -z "$db_url" ]; then
  echo "PG_CONNECTION_STRING not found in $env_file" >&2
  exit 1
fi

timestamp="$(date +%Y%m%d-%H%M%S)"
out_file="${2:-db/backups/$timestamp.dump}"

mkdir -p "$(dirname "$out_file")"
pg_dump --format=custom --no-owner --no-acl --file="$out_file" "$db_url"

dump_size="$(du -h "$out_file" | cut -f1)"

if [ ! -s "$out_file" ]; then
  echo "backup file is empty: $out_file" >&2
  exit 1
fi

echo "backup written to $out_file ($dump_size)"
