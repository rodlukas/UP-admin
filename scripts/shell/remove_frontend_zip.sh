#!/usr/bin/env bash
# pokud se jedna o tagged commit, smaz frontend.zip
# (uz muze ale byt smazany z predchoziho deploy)

if [ -n "$TRAVIS_TAG" ]; then
  rm -f frontend.zip
fi
