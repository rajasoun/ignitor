FROM rajasoun/php:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2

# Wordpress
ENV WORDPRESS_VERSION 4.7.5
ENV WORDPRESS_SHA1 fbe0ee1d9010265be200fe50b86f341587187302

# Install Wordpress
RUN set -x \
    # Upstream tarballs include ./wordpress/ so this gives us /usr/src/wordpress
    && curl -o wordpress.tar.gz -SL https://wordpress.org/wordpress-${WORDPRESS_VERSION}.tar.gz \
    && echo "$WORDPRESS_SHA1 *wordpress.tar.gz" | sha1sum -c - \
    && mkdir -p /usr/src/ \
    && tar -xzf wordpress.tar.gz -C /usr/src/ \
    && rm wordpress.tar.gz \
    && ln -s /usr/src/wordpress /var/www/wordpress
