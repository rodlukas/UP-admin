#!/usr/bin/env bash

mkdir geckodriver
# stazeni a rozbaleni geckodriveru
wget https://github.com/mozilla/geckodriver/releases/download/v0.26.0/geckodriver-v0.26.0-linux64.tar.gz -P geckodriver
tar -xzf geckodriver/geckodriver-v0.26.0-linux64.tar.gz -C geckodriver
# nastaveni do PATH
export PATH=$PATH:$PWD/geckodriver
