#!/usr/bin/env bash

if mv frontend/.npmrc.template frontend/.npmrc; then
  echo "✅ Soubor .npmrc je uspesne pripraven."
else
  echo "❌ CHYBA: Priprava souboru .npmrc selhala."
fi
