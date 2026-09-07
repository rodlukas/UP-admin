FROM python:3.12-slim

WORKDIR /usr/src/up-admin

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# copy pipenv files to container
COPY Pipfile Pipfile.lock ./

RUN pip install -U pipenv
RUN pipenv install --deploy --system

# copy all files and directories to container
COPY . .

# expose the port
EXPOSE 8000

# Fly proxy odpovedi nebufferuje, takze pomaly klient drzi spojeni az do timeoutu.
# Sync worker by u nej stal zablokovany v recv/sendall a obsadil jeden ze dvou procesu,
# proto gthread - pomale spojeni zabere jedno vlakno, ne cely worker.
# max-requests recykluje workery, aby jim na 256MB stroji nerostlo RSS bez omezeni.
CMD ["gunicorn", "--bind", ":8000", \
     "--worker-class", "gthread", "--workers", "2", "--threads", "4", \
     "--timeout", "60", "--graceful-timeout", "30", \
     "--max-requests", "500", "--max-requests-jitter", "50", \
     "up.wsgi"]
