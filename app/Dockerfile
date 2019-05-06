FROM python:3.7-alpine
RUN pip install pipenv \
 && apk add --update build-base gcc
ADD build.tar /skep
WORKDIR /skep
RUN pipenv sync
CMD pipenv run gunicorn webapp -b 0.0.0.0:8080
