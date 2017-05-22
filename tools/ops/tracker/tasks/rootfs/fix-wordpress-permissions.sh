#!/bin/bash

# terminate on errors
set -e

WP_OWNER=nobody # <-- wordpress owner
WP_GROUP=nobody # <-- wordpress group
WP_ROOT=/usr/src/wordpress # <-- wordpress root directory
WS_GROUP=nginx # <-- webserver group
WS_DATA=/var/www

# reset to safe defaults
find ${WP_ROOT} -exec chown ${WP_OWNER}:${WP_GROUP} {} \;
find ${WP_ROOT} -type d -exec chmod 755 {} \;
find ${WP_ROOT} -type f -exec chmod 644 {} \;

# allow wordpress to manage wp-config.php (but prevent world access)
chgrp ${WS_GROUP} ${WP_ROOT}/wp-config.php
chmod 660 ${WP_ROOT}/wp-config.php

# Check if volume is empty
if [ ! "$(ls -A "/var/www/wp-content" 2>/dev/null)" ]; then
    echo 'Setting up wp-content volume'
    # Copy wp-content from Wordpress src to volume
    cp -r /usr/src/wordpress/wp-content /var/www/

    # allow wordpress to manage wp-content
    find ${WS_DATA}/wp-content -exec chgrp ${WS_GROUP} {} \;
    find ${WS_DATA}/wp-content -type d -exec chmod 775 {} \;
    find ${WS_DATA}/wp-content -type f -exec chmod 664 {} \;

    #chown -R nobody.nobody /var/www

    # Generate secrets
    curl -f https://api.wordpress.org/secret-key/1.1/salt/ >> /usr/src/wordpress/wp-secrets.php
fi

exec "$@"

