#!/usr/bin/env bash

# funkce pro nahrazeni retezcu (arg1: $1) retezcem (arg2: $2)
substitute() {
  git grep -l "%$1" | xargs --no-run-if-empty sed -i "s|%$1|$2|g"
  echo -e "\t%$1\t --> \t\"$2\""
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
# nazev vetve (v pripade tagged commitu nazev tagu, pro PR nazev vetve PR)
BRANCH=${GITHUB_HEAD_REF:-$GITHUB_REF_NAME}
# viz https://docs.github.com/en/actions/learn-github-actions/environment-variables
# nazev tagu - pokud jde o tagged commit, v GITHUB_REF_NAME je nazev tagu, ktery vyuzijeme, jinak je tam nazev vetve a ten zahodime
RELEASE=$([[ "$GITHUB_REF_TYPE" == "tag" ]] && echo "$GITHUB_REF_NAME" || echo "")
DATETIME=$(git log -1 --format=%cd --date=format:"%d. %m. %Y, %H:%M:%S")
YEAR=$(git log -1 --format=%cd --date=format:"%Y")

# provedeni subtituce ve slozce $1
substitute_folder() {
  cd "$1" || {
    echo -e "❌ CHYBA: Substituce retezcu ve slozce \"$1\" se nepodarila.\n"
    exit 1
  }

  echo "🚀 Zacina substituce retezcu ve slozce \"$1\" :"

  substitute "$GIT_COMMIT_STRING" "$COMMIT"
  substitute "$GIT_RELEASE_STRING" "$RELEASE"
  substitute "$GIT_BRANCH_STRING" "$BRANCH"
  substitute "$GIT_DATETIME_STRING" "$DATETIME"
  substitute "$GIT_YEAR_STRING" "$YEAR"
  substitute "$SENTRY_DSN_STRING" "$SENTRY_DSN"

  cd "$GITHUB_WORKSPACE" || exit

  echo -e "✅ Substituce retezcu ve slozce \"$1\" byla uspesna.\n"
}

substitute_folder frontend/src
substitute_folder up
