FROM rajasoun/base:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2
ENV NPM_CONFIG_LOGLEVEL info
ENV YARN_VERSION 0.21.3

RUN set -ex \
  && apk add --update --no-cache nodejs \
  && rm -rf /var/cache/apk/*  \
  && npm install --global yarn@${YARN_VERSION}  \
  && mkdir /app

WORKDIR /app

# Init
ENTRYPOINT ["/init"]
CMD []

