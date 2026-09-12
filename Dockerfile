FROM python:3.14-slim

WORKDIR /usr/src/up-admin

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# copy pipenv files to container
COPY Pipfile Pipfile.lock ./

RUN pip install pipenv==2026.8.0 --only-binary :all:
RUN pipenv install --deploy --system

# copy all files and directories to container
COPY . .

# expose the port
EXPOSE 8000

# Fly proxy odpovedi nebufferuje, takze pomaly klient drzi spojeni az do timeoutu.
# Sync worker by u nej stal zablokovany v recv/sendall a obsadil jeden ze dvou procesu,
# proto gthread - pomale spojeni zabere jedno vlakno, ne cely worker.
# max-requests recykluje workery, aby jim na 256MB stroji nerostlo RSS bez omezeni.
# preload naimportuje Django app registry + WhiteNoise staticky index jednou v masteru
# misto 2x (jednou za kazdy worker) - sdileni pres copy-on-write snizuje soucet RSS
# na stroji, kde je to na hrane 256MB. Overeno fork-safety: zadny ready() hook,
# zadne eager DB/cache spojeni, _bank_executor i sentry-sdk se chovaji bezpecne po forku.
CMD ["gunicorn", "--bind", ":8000", \
     "--preload", \
     "--worker-class", "gthread", "--workers", "2", "--threads", "4", \
     "--timeout", "60", "--graceful-timeout", "30", \
     "--max-requests", "500", "--max-requests-jitter", "50", \
     "up.wsgi"]
