# FROM - Image to start building on.
FROM python:3.10

RUN apt update && apt install -y --no-install-recommends locales; rm -rf /var/lib/apt/lists/*; sed -i '/^#.* cs_CZ.UTF-8 /s/^#//' /etc/locale.gen; locale-gen

# sets the working directory
WORKDIR /usr/src/django-docker

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# copy these two files from <src> to <dest>
# <src> = current directory on host machine
# <dest> = filesystem of the container
COPY Pipfile Pipfile.lock ./

# install pipenv on the container
RUN pip install -U pipenv

# install project dependencies
RUN pipenv install --dev --system

# copy all files and directories from <src> to <dest>
COPY . .

# expose the port
EXPOSE 8000

# Command to run
CMD ["gunicorn", "--bind", ":8000", "--workers", "2", "up.wsgi"]
