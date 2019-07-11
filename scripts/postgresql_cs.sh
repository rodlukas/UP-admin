#!/usr/bin/env bash

# pridani CZ pro databazi
sudo apt-get update
sudo apt-get install language-pack-cs
sudo /etc/init.d/postgresql stop
sudo /etc/init.d/postgresql start
