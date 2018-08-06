#!/bin/sh

VERSION=$(git rev-parse --short HEAD)
echo "$VERSION"
git grep -l 'GIT_VERSION'
