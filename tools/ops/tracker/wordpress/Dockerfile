FROM rajasoun/base:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2

# Wordpress
ENV WORDPRESS_VERSION 4.7.4
ENV WORDPRESS_SHA1 153592ccbb838cafa1220de9174ec965df2e9e1a

# Install Packages
RUN set -x \
    && apk --no-cache add php7 php7-fpm php7-mysqli php7-json php7-openssl php7-curl \
    php7-zlib php7-xml php7-phar php7-intl php7-dom php7-xmlreader php7-ctype \
    php7-mbstring php7-gd nginx \
    --repository http://dl-cdn.alpinelinux.org/alpine/edge/main/ \
    --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing/ \
    && apk --no-cache add supervisor curl bash



# Install Wordpress
RUN set -x \
    # Upstream tarballs include ./wordpress/ so this gives us /usr/src/wordpress
      && curl -o wordpress.tar.gz -SL https://wordpress.org/wordpress-${WORDPRESS_VERSION}.tar.gz \
    	&& echo "$WORDPRESS_SHA1 *wordpress.tar.gz" | sha1sum -c - \
      && mkdir -p /usr/src/ \
    	&& tar -xzf wordpress.tar.gz -C /usr/src/ \
    	&& rm wordpress.tar.gz 

# Inject files in container file system
COPY rootfs /

# Chown Permissions
RUN set -x \
  && chown -R nobody.nobody /usr/src/wordpress
  && chown nobody.nobody /usr/src/wordpress/wp-config.php \
  && chmod 640 /usr/src/wordpress/wp-config.php \
  && chown nobody.nobody /usr/src/wordpress/wp-secrets.php \
  && chmod 640 /usr/src/wordpress/wp-secrets.php \
  && chown -R nobody.nobody /var/www


# wp-content volume
VOLUME /var/www/wp-content
WORKDIR /var/www/wp-content


EXPOSE 80

# Init
#ENTRYPOINT ["/init"]
ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
