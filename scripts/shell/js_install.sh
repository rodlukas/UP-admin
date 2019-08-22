#!/usr/bin/env bash

# travis zatim jinak nepodporuje nodejs 10
nvm install 10
npm i -g npm@~6.9.0
npm install -g yarn@~1.17.3
yarn install
