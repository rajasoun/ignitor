#!/bin/bash

# terminate on errors
set -e

docker exec -it tracker_tasks_1 wp core install --path=/usr/src/wordpress/ \
         --url=https://tracker.learn.cisco/tasks \
         --title="Tracker" \
         --admin_user=admin \
         --admin_password=vziMjlWd3^RoZRO%i# \
         --admin_email=rajasoun@icloud.com
docker exec -it tracker_tasks_1 /etc/cont-init.d/11-00-set-permissions
docker exec -it tracker_tasks_1 wp cli update --path=/usr/src/wordpress/ --allow-root

