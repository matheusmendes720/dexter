#!/usr/bin/env bash
# Updates only the MINIMAX_API_KEY= line in .env without printing its contents.
# Usage: ./scripts/update-minimax-key.sh <value>
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "usage: $0 <MINIMAX_API_KEY_value>" >&2
  exit 2
fi

NEW_KEY="$1"
ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
  echo "MISSING:.env"
  exit 1
fi

TMP="${ENV_FILE}.tmp.$$"
awk -v k="$NEW_KEY" '
  BEGIN { replaced=0 }
  /^MINIMAX_API_KEY=/ { print "MINIMAX_API_KEY=" k; replaced=1; next }
  /^# *MINIMAX_API_KEY=/ { next }
  { print }
  END {
    if (!replaced) print "MINIMAX_API_KEY=" k
  }
' "$ENV_FILE" > "$TMP"

mv "$TMP" "$ENV_FILE"

# Verify without printing the key
COUNT=$(grep -c '^MINIMAX_API_KEY=' "$ENV_FILE" || true)
PREFIX=$(awk -F= '/^MINIMAX_API_KEY=/{print substr($2,1,7); exit}' "$ENV_FILE")
LEN=$(awk -F= '/^MINIMAX_API_KEY=/{print length($2); exit}' "$ENV_FILE")

if [ "$COUNT" = "1" ] && [ -n "$PREFIX" ]; then
  echo "OK:lines=$COUNT prefix=${PREFIX}... length=$LEN"
else
  echo "FAIL:count=$COUNT prefix=$PREFIX"
  exit 1
fi
