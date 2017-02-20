FROM rajasoun/base:0.1
LABEL Vendor="Alpine"
MAINTAINER Raja. S <rajasoun@icloud.com>

RUN set -x \
        # Install MariaDB
        && echo http://dl-4.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories \
        && apk add --no-cache mariadb-client mongodb-tools curl \
        # Cleanup
        && rm -rf /var/cache/apk/* \
        && rm -rf /tmp/src \
        && rm -rf /tmp/*

# Init
ENTRYPOINT ["/init"]
CMD []
