FROM python:3.7-alpine
RUN pip install pipenv \
 && apk add --update build-base gcc npm \
 && mkdir /skep
COPY Pipfile Pipfile.lock /skep/
WORKDIR /skep
RUN pipenv sync
ADD build.tar .
RUN npm install && NODE_ENV=production npx webpack
CMD pipenv run gunicorn webapp -b 0.0.0.0:8080 -k eventlet
