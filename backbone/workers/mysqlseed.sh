#!/usr/bin/env sh


docker exec -it ckdb  sh -c  'mysql  -u ckuser -pCisco@1234 b2b  < /opt/data/seed.sql'
