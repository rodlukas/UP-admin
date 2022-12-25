#!/usr/bin/env bash

# smaze obsah databaze (krome Django tabulek, tedy ponecha i uzivatele) a nahraje misto toho sample data
psql "$DATABASE_URL" -c "TRUNCATE TABLE admin_application, admin_course, admin_group, admin_lecture, admin_membership, admin_client, admin_attendancestate, admin_attendance CASCADE;"
psql "$DATABASE_URL" -f scripts/sql/sample_data.pgsql
