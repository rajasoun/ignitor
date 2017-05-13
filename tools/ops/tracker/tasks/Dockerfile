FROM rajasoun/wordpress:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2


# Configure Wordpress
RUN set -x \
      && curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
      && chmod +x ./wp-cli.phar \
      && php wp-cli.phar --allow-root cli version \
      && mv ./wp-cli.phar /usr/bin/wp \
      && chown -R nobody.nobody /var/www
