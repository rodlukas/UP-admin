#!/usr/bin/env bash

if [ -z "${FONTAWESOME_TOKEN}" ]; then
  echo "FONTAWESOME_TOKEN neni nastaven nebo je prazdny"
else
  mv frontend/.npmrc.template frontend/.npmrc
  echo "soubor .nmprc byl uspesne pripraven"
fi
