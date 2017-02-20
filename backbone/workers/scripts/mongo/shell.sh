#!/usr/bin/with-contenv sh
#
# @description
# Script used to perform mongo shell operation
#
##

set -e

echo "Job Data Seed started: $(date)"

mongo --quiet --host $MONGO_HOST:$MONGO_PORT --db $MONGO_DB_NAME  < /tmp/mongodb/seed.js

echo "Job Data Seed finished: $(date)"
