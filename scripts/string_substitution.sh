#!/usr/bin/env bash

# funkce pro nahrazeni retezcu (arg1: $1) retezcem (arg2: $2)
substitute() {
    git grep -l "$1" | xargs sed -i "s/$1/$2/g"
    echo "nahrazeni $1 hodnotou $2 probehlo uspesne"
}

# nastaveni konstant, ktere budou nahrazeny
GIT_VERSION_STRING='GIT_VERSION'
GIT_RELEASE_STRING='GIT_RELEASE'
GIT_DATETIME_STRING='GIT_DATETIME'

# nastaveni novych hodnot pro nahrazovane retezce
VERSION=$(git rev-parse --short HEAD)
RELEASE=$TRAVIS_TAG
DATETIME=$(git log -1 --format=%cd --date=format:"%d. %m. %Y, %H:%M:%S")

# prikazy k provedeni
cd frontend

substitute "$GIT_VERSION_STRING" "$VERSION"
substitute "$GIT_RELEASE_STRING" "$RELEASE"
substitute "$GIT_DATETIME_STRING" "$DATETIME"

cd ..
