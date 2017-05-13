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
      && wp core install --path=/usr/src/wordpress/ --url=https://tracker.learn.cisco/actions --title="Tracker" --admin_user=admin --admin_password=vziMjlWd3^RoZRO%i# --admin_email=rajasoun@icloud.com \
      && curl -O https://github.com/rajasoun/glfs/blob/master/tracker/taskrocket.zip \
      && mv taskrocket.zip /tmp \
      && wp theme install --path=/usr/src/wordpress/ taskrocket.zip --activate \
      && rm taskrocket.zip