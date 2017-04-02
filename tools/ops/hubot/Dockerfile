FROM rajasoun/nodejs:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2
ENV NODE_ENV production

RUN set -ex \
  && apk add --no-cache redis  \
  && yarn global add  coffee-script \
  && yarn global add yo generator-hubot \
  && rm -rf /var/cache/apk/*

User hubot
WORKDIR /hubot

COPY package.json package.json
ADD config/hubot-scripts.json /hubot/
ADD config/external-scripts.json /hubot/

RUN set -ex \
    && mkdir -p /root/.config/configstore \
    && mkdir -p /hubot/bin \
    && chmod g+rwx /root /root/.config /root/.config/configstore /hubot/bin  \
    && yo hubot --owner="Raja. S <rajasoun@icloud.com>" --name="sparkbot" --description="Cisco Spark Hubot" --defaults


# Init
ENTRYPOINT ["/init"]
CMD []


