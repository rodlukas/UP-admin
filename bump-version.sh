#!/bin/sh

VERSION=$(git rev-parse --short HEAD)
git grep -l 'GIT_VERSION'
git grep -l 'GIT_VERSION' | xargs sed -i "s/GIT_VERSION/$VERSION/g"
