#!/usr/bin/env bash

# instalace postgresql 12 na travis (umi zatim jen 10)
sudo apt-get update
sudo apt-get --yes remove postgresql\*
sudo apt-get install -y postgresql-12 postgresql-client-12
sudo cp /etc/postgresql/{9.6,12}/main/pg_hba.conf
sudo service postgresql restart 12
