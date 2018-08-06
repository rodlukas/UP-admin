#!/bin/sh

cd frontend
VERSION=$(git rev-parse --short HEAD)
GIT_VERSION_STRING='GIT_COMMIT_VERSION'
echo $VERSION
git grep -l $GIT_VERSION_STRING | xargs sed -i "s/$GIT_VERSION_STRING/$VERSION/g"
cd ..
