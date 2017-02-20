FROM rajasoun/base:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2


# do all in one step
RUN set -ex \
    && echo http://dl-4.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories \
    && apk add --no-cache mongodb  \
    && mkdir -p /data/db \
    && chown mongodb:mongodb /data/db \
    && rm /usr/bin/mongosniff /usr/bin/mongoperf \
    && rm -rf /var/cache/apk/* /src

VOLUME /data/db
EXPOSE 27017 28017


## Init
ENTRYPOINT ["/init"]
CMD []

