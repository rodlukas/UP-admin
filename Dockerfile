FROM python:3.10

WORKDIR /usr/src/up-admin

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# copy these two files from <src> to <dest>
# <src> = current directory on host machine
# <dest> = filesystem of the container
COPY Pipfile Pipfile.lock ./

RUN pip install -U pipenv
RUN pipenv install --deploy --system

# copy all files and directories from <src> to <dest>
COPY . .

# expose the port
EXPOSE 8000

CMD ["gunicorn", "--bind", ":8000", "--workers", "2", "up.wsgi"]
