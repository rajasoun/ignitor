#!/bin/bash

# terminate on errors
set -e

WP_OWNER=nobody # <-- wordpress owner
WP_GROUP=nobody # <-- wordpress group
WP_ROOT=/usr/src/wordpress # <-- wordpress root directory
WS_GROUP=nginx # <-- webserver group

# reset to safe defaults
find ${WP_ROOT} -exec chown ${WP_OWNER}:${WP_GROUP} {} \;
find ${WP_ROOT} -type d -exec chmod 755 {} \;
find ${WP_ROOT} -type f -exec chmod 644 {} \;

# allow wordpress to manage wp-config.php (but prevent world access)
chgrp ${WS_GROUP} ${WP_ROOT}/wp-config.php
chmod 660 ${WP_ROOT}/wp-config.php

# allow wordpress to manage wp-content
find ${WP_ROOT}/wp-content -exec chown ${WS_GROUP}:${WS_GROUP} {} \;
find ${WP_ROOT}/wp-content -type d -exec chmod 775 {} \;
find ${WP_ROOT}/wp-content -type f -exec chmod 664 {} \;

