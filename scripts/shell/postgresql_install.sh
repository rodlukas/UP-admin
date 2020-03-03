#!/usr/bin/env bash

# instalace postgresql 12 na travis (v zakladu ji nepodporuje)
# inspirace viz: https://stackoverflow.com/questions/55161807/travis-ci-not-connecting-to-postgresql-11-2
sudo apt-get update
sudo apt-get --yes remove postgresql\*
sudo apt-get install -y postgresql-12 postgresql-client-12
sudo cp /etc/postgresql/{9.6,12}/main/pg_hba.conf
# zmena mapovani portu, viz https://travis-ci.community/t/postgres-default-port-changed-from-5432-to-5433/7347/3
sudo sed -i 's/port = 5433/port = 5432/' /etc/postgresql/12/main/postgresql.conf
sudo service postgresql restart 12
