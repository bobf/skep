FROM alpine:3.9.3
ADD build.tar /skep
RUN apk --update add python3 wget \
 && wget 'https://bootstrap.pypa.io/get-pip.py' -O get-pip.py \
 && python3 get-pip.py \
 && pip install pipenv \
 && cd /skep \
 && pipenv sync
WORKDIR /skep
CMD FLASK_APP=app/controller.py pipenv run python webapp.py
