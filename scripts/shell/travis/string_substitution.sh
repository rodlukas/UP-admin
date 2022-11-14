#!/usr/bin/env bash

# funkce pro nahrazeni retezcu (arg1: $1) retezcem (arg2: $2)
substitute() {
  git grep -l "%$1" | xargs --no-run-if-empty sed -i "s|%$1|$2|g"
  echo "- nahrazeni \"$1\" hodnotou \"$2\" bylo uspesne"
}

# nastaveni konstant, ktere budou nahrazeny
GIT_COMMIT_STRING='GIT_COMMIT'
GIT_RELEASE_STRING='GIT_RELEASE'
GIT_BRANCH_STRING='GIT_BRANCH'
GIT_DATETIME_STRING='GIT_DATETIME'
GIT_YEAR_STRING='GIT_YEAR'
SENTRY_DSN_STRING='SENTRY_DSN'

# nastaveni novych hodnot pro nahrazovane retezce
COMMIT=$(git rev-parse --short HEAD)
# viz https://docs.travis-ci.com/user/environment-variables/
RELEASE=$TRAVIS_TAG
BRANCH=$TRAVIS_BRANCH
DATETIME=$(git log -1 --format=%cd --date=format:"%d. %m. %Y, %H:%M:%S")
YEAR=$(git log -1 --format=%cd --date=format:"%Y")

# provedeni subtituce ve slozce $1
substitute_folder() {
  cd "$1" || {
    echo "CHYBA - Substituce retezcu ve slozce \"$1\" se nepodarila"
    exit 1
  }

  echo "* Zacina substituce retezcu ve slozce \"$1\""

  substitute "$GIT_COMMIT_STRING" "$COMMIT"
  substitute "$GIT_RELEASE_STRING" "$RELEASE"
  substitute "$GIT_BRANCH_STRING" "$BRANCH"
  substitute "$GIT_DATETIME_STRING" "$DATETIME"
  substitute "$GIT_YEAR_STRING" "$YEAR"
  substitute "$SENTRY_DSN_STRING" "$SENTRY_DSN"

  cd "$GITHUB_WORKSPACE" || exit

  echo "* Substituce retezcu ve slozce \"$1\" byla uspesna"
}

substitute_folder frontend/src
ls -la
substitute_folder up
