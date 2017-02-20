FROM rajasoun/base:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2
ENV LANG=en_US.utf8
ENV DB_PATH=/data/db


# do all in one step
RUN set -ex \
    && echo http://dl-4.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories \
    && apk add --no-cache mongodb mongodb-tools \
    && mkdir -p ${DB_PATH} \
    && chown mongodb:mongodb ${DB_PATH} \
    && rm /usr/bin/mongosniff /usr/bin/mongoperf \
    && rm -rf /var/cache/apk/* /src

# Inject files in container file system
COPY rootfs /

VOLUME ["${DB_PATH}"]
EXPOSE 27017


## Init
ENTRYPOINT ["/init"]
CMD []

