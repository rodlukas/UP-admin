#!/usr/bin/env bash
# pokud se jedna o tagged commit, vytvor frontend.zip
# se sestavenym frontendem (vcetne template) pro nahrani na GH

if [ "$GITHUB_REF_TYPE" = "tag" ]; then
  zip --must-match --recurse-paths frontend.zip frontend/build admin/templates/react-autogenerate.html --exclude frontend/build/assets/react-autogenerate.html
  echo "✅ Soubor frontend.zip byl uspesne vytvoren."
else
  echo "ℹ️ Soubor frontend.zip nebyl vytvoren, protoze se nejedna o tagged commit."
fi
