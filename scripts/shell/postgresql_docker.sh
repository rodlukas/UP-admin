#!/usr/bin/env bash

docker build -t postgresql_cz_image -f db/Dockerfile.postgresql .
docker run -d --name postgresql_cz -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e LC_ALL=cs_CZ.UTF-8 postgresql_cz_image
until docker exec postgresql_cz pg_isready -U postgres; do sleep 1; done
