#!/usr/bin/env bash
# pokud se jedna o tagged commit, smaz frontend.zip
# (uz muze ale byt smazany z predchoziho deploy)

if [ "$GITHUB_REF_TYPE" = "tag" ]; then
  rm -f frontend.zip
  echo "✅ Soubor frontend.zip byl uspesne smazan."
else
  echo "ℹ️ Soubor frontend.zip nebylo potreba mazat, protoze se nejedna o tagged commit."
fi
