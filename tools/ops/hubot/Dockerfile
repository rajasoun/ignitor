FROM rajasoun/nodejs:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2
ENV NODE_ENV production

RUN set -ex \
  && apk add --no-cache redis  \
  && npm install coffee-script -g \
  && npm install yo generator-hubot -g \
  && rm -rf /var/cache/apk/*

WORKDIR /hubot


RUN set -ex \
    && mkdir -p /root/.config/configstore \
    && mkdir -p /hubot/bin \
    && mkdir -p /root/.npm \
    && chmod g+rwx /root /root/.config /root/.config/configstore /root/.npm/coffee-script /hubot/bin /hubot  /root/.npm \
    && yo hubot --owner="Raja. S <rajasoun@icloud.com>" --name="sparkbot" --description="Cisco Spark Hubot" --defaults

# Init
ENTRYPOINT ["/init"]
CMD []


