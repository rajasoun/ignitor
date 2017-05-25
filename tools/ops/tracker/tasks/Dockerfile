FROM wordpress:latest
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

ADD config/wp-config.php  /var/www/html
ADD

RUN curl -f https://api.wordpress.org/secret-key/1.1/salt/ >> ${WP_ROOT}/wp-secrets.php
RUN chmod 644 wp-config.php wp-secrets.php
RUN chown www-data:www-data wp-config.php wp-secrets.php

#EXPOSE 80
#
## Init
#ENTRYPOINT ["/init"]
#CMD []
