FROM rajasoun/nodejs:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2
ENV NODE_ENV production

RUN set -ex \
    && mkdir -p /root/.config \
    && mkdir -p /root/.npm \
    && mkdir -p /hubot/bin \

    && chmod g+rwx /root /root/.npm /root/.config  \
                   /hubot /hubot/bin

RUN set -ex \
  && apk add --no-cache redis  \
  && npm install coffee-script -g \
  && npm install yo generator-hubot -g \
  && yo hubot --owner="Raja. S <rajasoun@icloud.com>" \
              --name="sparkbot" \
              --description="Cisco Spark Hubot" \
              --defaults \
  && rm -rf /var/cache/apk/*

WORKDIR /hubot



# Init
ENTRYPOINT ["/init"]
CMD []


