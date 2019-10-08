FROM python:3.7-alpine
RUN pip install pipenv \
 && apk add --update build-base gcc npm outils-md5 \
 && mkdir /skep
COPY Pipfile Pipfile.lock /skep/
WORKDIR /skep
RUN pipenv sync
ADD build.tar /skep
CMD ["pipenv", "run", "python", "app.py"]
