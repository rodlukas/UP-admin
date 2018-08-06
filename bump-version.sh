#!/bin/sh

cd frontend
VERSION=$(git rev-parse --short HEAD)
GIT_VERSION_STRING='GIT_VERSION'
echo $VERSION
FILES="$(git grep -l $GIT_VERSION_STRING)"
echo "nahrazovani GIT_VERSION v souborech:"
echo $FILES | xargs sed -i "s/$GIT_VERSION_STRING/$VERSION/g"
cd ..
