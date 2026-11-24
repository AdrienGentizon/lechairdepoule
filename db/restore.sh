#!/bin/sh
set -eu

if [ -z "${1:-}" ] || [ -z "${2:-}" ]; then
  echo "usage: pnpm db:restore <env-file> <file>" >&2
  exit 1
fi

env_file="$1"
in_file="$2"

if [ ! -f "$env_file" ]; then
  echo "env file not found: $env_file" >&2
  exit 1
fi

if [ ! -f "$in_file" ]; then
  echo "file not found: $in_file" >&2
  exit 1
fi

db_url="$(sed -n 's/^PG_CONNECTION_STRING=//p' "$env_file" | tail -n 1 | tr -d "\"'")"

if [ -z "$db_url" ]; then
  echo "PG_CONNECTION_STRING not found in $env_file" >&2
  exit 1
fi

echo "target: $env_file"
echo "file:   $in_file"
printf "tables will be dropped and recreated. continue? [y/N] "
read -r answer

if [ "$answer" != "y" ]; then
  echo "aborted"
  exit 1
fi

neon_column_options='SET (pg_attver='

pg_restore --clean --if-exists --no-owner --no-acl --file=- "$in_file" \
  | grep -vF "$neon_column_options" \
  | psql "$db_url" --single-transaction --quiet -v ON_ERROR_STOP=1

echo "restore done"

