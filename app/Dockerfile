FROM python:3.7-alpine
RUN pip install pipenv \
 && apk add --update build-base gcc npm outils-md5 python2 \
 && mkdir /skep
COPY Pipfile Pipfile.lock /skep/
WORKDIR /skep
RUN pipenv sync
ADD build.tar .
RUN NODE_ENV=development npm install \
 && NODE_ENV=production npx webpack \
 && JS_MD5="$(md5sum dist/bundle.js | awk '{ print $1 }')" \
 && CSS_MD5="$(md5sum files/main.css | awk '{ print $1 }')" \
 && mv files/bundle.js "dist/bundle-${JS_MD5}.js" \
 && mv files/main.css "files/main-${CSS_MD5}.css" \
 && echo "export JS_MD5='${JS_MD5}'; export CSS_MD5='${CSS_MD5}';" > /assets.sh \
 && echo "Assets compiled:" \
 && cat /assets.sh
COPY ./skep/ /skep/skep
CMD ./run
