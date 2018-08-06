#!/bin/sh

cd frontend
VERSION=$(git rev-parse --short HEAD)
DATETIME=$(git log -1 --format=%cd --date=iso)
GIT_VERSION_STRING='GIT_VERSION'
GIT_DATETIME_STRING='GIT_DATETIME'
git grep -l $GIT_VERSION_STRING | xargs sed -i "s/$GIT_VERSION_STRING/$VERSION/g"
git grep -l $GIT_DATETIME_STRING | xargs sed -i "s/$GIT_DATETIME_STRING/$DATETIME/g"
cd ..
