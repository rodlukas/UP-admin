#!/usr/bin/env bash

VERSION=0.32.1
GITHUB_REPO_URL=https://github.com/mozilla/geckodriver

mkdir geckodriver
# stazeni a rozbaleni geckodriveru
wget ${GITHUB_REPO_URL}/releases/download/v${VERSION}/geckodriver-v${VERSION}-linux64.tar.gz -P geckodriver
tar -xzf geckodriver/geckodriver-v${VERSION}-linux64.tar.gz -C geckodriver
# nastaveni do PATH
export PATH=$PATH:$PWD/geckodriver
