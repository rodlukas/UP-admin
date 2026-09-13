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

# Fly proxy odpovedi nebufferuje, takze pomaly klient drzi spojeni az do timeoutu -
# proto gthread: takove spojeni zabere jedno vlakno, ne cely worker.
# Jediny worker: stroj ma 1 sdilene vCPU, takze druhy proces nepridava zadnou CPU
# paralelizaci, jen dalsi kopii interpretru a Djanga - a ta je na 256MB stroji
# nejvetsi jednotlivou polozkou. Kapacitu drzi 4 vlakna, coz pokryje paralelni
# requesty jednoho nacteni stranky i s rezervou na pomaleho klienta.
# preload sdili Django app registry a WhiteNoise staticky index s workerem pres
# copy-on-write a dela z recyklace rychly fork misto plneho importu. Fork-safety
# overena: zadny ready() hook, zadne eager DB/cache spojeni, _bank_executor
# i sentry-sdk se po forku chovaji bezpecne.
# max-requests je pojistka proti rustu RSS.
# access log jde na stdout, tedy do `fly logs` - bez nej neni u incidentu videt, jake
# requesty byly v letu.
CMD ["gunicorn", "--bind", ":8000", \
     "--preload", \
     "--worker-class", "gthread", "--workers", "1", "--threads", "4", \
     "--timeout", "60", "--graceful-timeout", "30", \
     "--max-requests", "500", "--max-requests-jitter", "50", \
     "--access-logfile", "-", \
     "--access-logformat", "%(m)s %(U)s%(q)s %(s)s %(b)s %(M)sms", \
     "up.wsgi"]
