FROM python:3.9-alpine
RUN pip install pipenv \
 && apk add --update build-base gcc npm outils-md5 \
 && mkdir /skep \
 && mkdir /skep/database/
COPY Pipfile Pipfile.lock /skep/
WORKDIR /skep
RUN pipenv sync
ADD build.tar /skep
COPY ./skep/ /skep/skep
CMD ["pipenv", "run", "python", "app.py"]
