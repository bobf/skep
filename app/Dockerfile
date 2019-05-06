FROM python:3.7-alpine
ADD build.tar /skep
RUN pip install pipenv
RUN cd /skep && pipenv sync
RUN apk add --update gcc
WORKDIR /skep
CMD FLASK_APP=controller.py pipenv run python webapp.py
