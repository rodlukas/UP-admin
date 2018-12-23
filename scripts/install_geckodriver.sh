#!/usr/bin/env bash
wget https://github.com/mozilla/geckodriver/releases/download/v0.23.0/geckodriver-v0.23.0-linux64.tar.gz
mkdir geckodriver
tar -xzf geckodriver-v0.23.0-linux64.tar.gz -C geckodriver
export PATH=$PATH:$PWD/geckodriver