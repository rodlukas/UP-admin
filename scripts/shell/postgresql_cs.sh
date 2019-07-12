#!/usr/bin/env bash

# pridani ceskeho balicku pro funkcni CZ v databazi
sudo apt-get update
sudo apt-get install language-pack-cs
sudo /etc/init.d/postgresql stop
sudo /etc/init.d/postgresql start
