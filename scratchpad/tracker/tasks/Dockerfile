FROM rajasoun/base:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2

# Wordpress
ENV WORDPRESS_VERSION 4.7.5
ENV WORDPRESS_SHA1 fbe0ee1d9010265be200fe50b86f341587187302

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


# Install Nginx
RUN set -x \
    && apk add --no-cache nginx curl bash \
    && chown -R nginx:www-data /var/lib/nginx \
    && rm -rf /var/cache/apk/*

RUN set -x \
    && ln -sf /dev/stdout /var/log/nginx/access.log  \
    && rm -rf /etc/nginx/conf.d/default.conf \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Install Wordpress
RUN set -x \
    # Upstream tarballs include ./wordpress/ so this gives us /usr/src/wordpress
    && curl -o wordpress.tar.gz -SL https://wordpress.org/wordpress-${WORDPRESS_VERSION}.tar.gz \
    && echo "$WORDPRESS_SHA1 *wordpress.tar.gz" | sha1sum -c - \
    && mkdir -p /usr/src/ \
    && tar -xzf wordpress.tar.gz -C /usr/src/ \
    && rm wordpress.tar.gz

# Install WP-CLI
RUN set -x \
      && curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
      && chmod +x ./wp-cli.phar \
      && php wp-cli.phar --allow-root cli version \
      && mv ./wp-cli.phar /usr/bin/wp

# Inject files in container file system
COPY rootfs /

# wp-content volume
VOLUME /var/www/wp-content
WORKDIR /var/www/wp-content

EXPOSE 80

# Init
ENTRYPOINT ["/init"]
CMD []
