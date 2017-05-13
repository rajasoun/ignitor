#!/bin/bash

# terminate on errors
set -e

chown -R nobody.nobody /var/www
wp core install --path=/usr/src/wordpress/ \
        --url=https://tracker.learn.cisco/tasks \
        --title="Tracker" --admin_user=admin \
        --admin_password=vziMjlWd3^RoZRO%i# \
        --admin_email=rajasoun@icloud.com
wp cli update --path=/usr/src/wordpress/

exec "$@"
