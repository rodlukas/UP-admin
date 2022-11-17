#!/usr/bin/env bash

if [ -z "${GPR_TOKEN}" ]; then
  echo "❌ CHYBA: Soubor .npmrc neni pripraven. GPR_TOKEN (Github Package Registry token pro PRO verzi FontAwesome) neni nastaven nebo je prazdny."
else
  if mv frontend/.npmrc.template frontend/.npmrc; then
    echo "✅ Soubor .npmrc je uspesne pripraven."
  else
    echo "❌ CHYBA: Priprava souboru .npmrc selhala."
  fi
fi
