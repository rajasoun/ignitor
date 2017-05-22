#!/bin/bash

# terminate on errors
set -e

docker exec -it tracker_tasks_1 wp cli update --path=/usr/src/wordpress/ --allow-root
