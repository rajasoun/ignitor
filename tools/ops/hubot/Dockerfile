FROM rajasoun/nodejs:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2
ENV NODE_ENV production

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN set -ex \
  && addgroup -g 2000 hubot \
  && adduser -u 2000 -G hubot -s /bin/sh -D hubot \
  && apk add --no-cache redis  \
  && rm -rf /var/cache/apk/*

USER  hubot
WORKDIR /hubot

#RUN set -ex \
#  && yarn add coffee-script \
#  && yarn add  yo generator-hubot

RUN yo hubot --owner="Raja. S <rajasoun@icloud.com>" --name="sparkbot" --description="Cisco Spark Hubot" --defaults
ADD config/hubot-scripts.json /hubot/
ADD config/external-scripts.json /hubot/
COPY package.json package.json


