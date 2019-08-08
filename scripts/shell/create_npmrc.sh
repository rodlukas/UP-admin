#!/usr/bin/env bash

if [ -z "${FONTAWESOME_TOKEN}" ]; then
  echo "CHYBA - FONTAWESOME_TOKEN neni nastaven nebo je prazdny, soubor .npmrc neni pripraven"
else
  if mv frontend/.npmrc.template frontend/.npmrc; then
    echo "Soubor .npmrc byl uspesne pripraven"
  else
    echo "CHYBA - Priprava souboru .npmrc byla neuspesna"
  fi
fi
