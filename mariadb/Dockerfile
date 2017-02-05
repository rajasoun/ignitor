FROM rajasoun/base:0.0.0-8e44339
LABEL Vendor="Alpine"
MAINTAINER Raja. S <rajasoun@icloud.com>

RUN set -x \
    RUN \
        # Install MariaDB
        apk add --no-cache --update mariadb-common mariadb mariadb-client \
        # Cleanup
        && rm -rf /var/cache/apk/* \
        && rm -rf /tmp/src \
        && rm -rf /tmp/*

# Inject files in container file system
COPY rootfs /

# Expose ports for the MySql service
EXPOSE 3306

# Init
ENTRYPOINT ["/init"]
