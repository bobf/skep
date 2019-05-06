FROM python:3.7-alpine
ADD build.tar /skep
RUN pip install pipenv
RUN apk add --update build-base gcc
RUN cd /skep && pipenv sync
WORKDIR /skep
CMD pipenv run gunicorn webapp -b 0.0.0.0:8080
