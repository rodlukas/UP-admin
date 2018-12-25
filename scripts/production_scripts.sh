#!/usr/bin/env bash

# spust skripty pro upravu souboru
source create_npmrc.sh
source string_substitution.sh

# nainstaluj JS zavislosti
nvm install 8.12.0
npm i -g npm@~6.4.1
npm install -g yarn@~1.10.0
yarn install

# nainstaluj Python zavislosti
pip install pipenv
pipenv install --dev
