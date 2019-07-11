#!/usr/bin/env bash

# vytvori soubor dist.zip se sestavenym frontendem ve slozce frontend
cd frontend
zip -r dist.zip dist
cd ..
