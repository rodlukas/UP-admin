#!/usr/bin/env bash

# Rozdeleni UI stage na shardy je rucni seznam, ale nesmi z nej nic vypadnout: scenar,
# ktery neni v zadnem shardu, by v CI tise nebezel a nic by nezcervenalo. Tenhle skript
# proto trva na tom, ze sjednoceni shardu je presne mnozina feature souboru - odhali
# jak zapomenuty novy soubor, tak omylem zdvojeny.

set -euo pipefail

SHARDS_FILE=.github/ui-shards.json

listed=$(jq -r '.[]' "$SHARDS_FILE" | tr ' ' '\n' | grep -v '^$' | sort)
actual=$(find tests/features -name '*.feature' -exec basename {} .feature \; | sort)

if [[ "$listed" != "$actual" ]]; then
    echo "::error file=$SHARDS_FILE::Shardy neodpovidaji feature souborum v tests/features"
    diff <(echo "$listed") <(echo "$actual") | sed 's/^</  navic ve shardech: /; s/^>/  chybi ve shardech: /' || true
    exit 1
fi

echo "✅ Shardy pokryvaji vsech $(echo "$actual" | wc -l | tr -d ' ') feature souboru, kazdy prave jednou."
