#!/usr/bin/env bash

psql -c 'CREATE DATABASE travis_ci_test;' -U postgres
psql -c 'CREATE ROLE travis SUPERUSER LOGIN CREATEDB;' -U postgres
cp config/database.yml.travis config/database.yml
