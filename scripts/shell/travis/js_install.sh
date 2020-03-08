#!/usr/bin/env bash

# travis zatim jinak nepodporuje nodejs 12
nvm install 12
npm i -g npm@6
npm install -g yarn@1
yarn install
