FROM wordpress:latest
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>


# WP config
COPY wp-config.php /var/www/html
RUN chown www-data:www-data /var/www/html/wp-config.php && chmod 644 /var/www/html/wp-config.php

# Append WP secrets
COPY wp-secrets.php /var/www/html
RUN chown www-data:www-data /var/www/html/wp-secrets.php && chmod 644 /var/www/html/wp-secrets.php

RUN curl -f https://api.wordpress.org/secret-key/1.1/salt/ >> /var/www/html/wp-secrets.php

#EXPOSE 80
#
## Init
#ENTRYPOINT ["/init"]
#CMD []
