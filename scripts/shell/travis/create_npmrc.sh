#!/usr/bin/env bash

if [ -z "${GPR_TOKEN}" ]; then
  echo "CHYBA - GPR_TOKEN (Github Package Registry token pro PRO verzi FontAwesome) neni nastaven nebo je prazdny, soubor .npmrc neni pripraven"
else
  if mv frontend/.npmrc.template frontend/.npmrc; then
    echo "Soubor .npmrc byl uspesne pripraven"
  else
    echo "CHYBA - Priprava souboru .npmrc byla neuspesna"
  fi
fi
