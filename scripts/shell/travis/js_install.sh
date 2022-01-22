#!/usr/bin/env bash

# travis zatim jinak nepodporuje nodejs 12
nvm install 16
npm i -g npm@8
npm install -g yarn@1
yarn install
