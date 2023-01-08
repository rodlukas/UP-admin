FROM postgres:14

RUN localedef -i cs_CZ -c -f UTF-8 -A /usr/share/locale/locale.alias cs_CZ.UTF-8

ENV LANG cs_CZ.utf8

# copy the file with sample data that can be optionally applied
COPY scripts/sql/sample_data.pgsql .
