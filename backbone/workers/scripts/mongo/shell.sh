#!/usr/bin/with-contenv sh
#
# @description
# Script used to perform mongo shell operation
#
##

set -e

echo "Job Data Seed started: $(date)"

mongo --host $MONGO_HOST:$MONGO_PORT  < /tmp/mongodb/data/seed.js

echo "Job Data Seed finished: $(date)"
