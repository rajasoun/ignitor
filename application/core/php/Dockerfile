FROM rajasoun/base:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2


# Install php 7
RUN set -x \
    && apk add php7 php7-session php7-fpm php7-json php7-zlib php7-xml \
        php7-pdo php7-phar php7-openssl \
        php7-pdo_mysql php7-mysqli php7-mysqlnd php7-mcrypt \
        php7-gd php7-curl php7-opcache php7-ctype php7-mbstring \
        php7-intl php7-bcmath php7-dom php7-xmlreader \
        --update-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing/ \
    && rm -rf /var/cache/apk/*  \
    && rm -rf /tmp/*

# Tweaks
RUN set -x \
    && ln -s /usr/bin/php7 /usr/bin/php  \
    && ln -s /usr/sbin/php-fpm7 /usr/bin/php-fpm  \
    && ln -s /usr/lib/php7 /usr/lib/php \
    && ln -s /etc/php7 /etc/php

RUN set -x \
    && apk add --no-cache nginx curl\
    && chown -R nginx:www-data /var/lib/nginx \
    && rm -rf /var/cache/apk/*

RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# Expose the ports for nginx
EXPOSE 80

# Inject files in container file system
COPY rootfs /

VOLUME ["/var/www", "/var/log/nginx"]


# Init
ENTRYPOINT ["/init"]
CMD []
