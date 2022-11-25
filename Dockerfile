FROM python:3.10

WORKDIR /usr/src/up-admin

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# copy pipenv files to container
COPY Pipfile Pipfile.lock ./

RUN pip install -U pipenv
RUN pipenv install --deploy --system

# copy all files and directories to container
COPY . .

# expose the port
EXPOSE 8000

CMD ["gunicorn", "--bind", ":8000", "--workers", "2", "up.wsgi"]
