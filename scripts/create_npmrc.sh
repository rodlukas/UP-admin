#!/usr/bin/env bash

if [ -z "${FONTAWESOME_TOKEN}" ]; then
    echo "FONTAWESOME_TOKEN neni nastaven nebo je prazdny"
else
    NPMRC_CONTENT="//npm.fontawesome.com/:_authToken=${FONTAWESOME_TOKEN}\n"
    printf $NPMRC_CONTENT >> frontend/.npmrc
    echo "soubor .nmprc byl uspesne upraven"
fi
