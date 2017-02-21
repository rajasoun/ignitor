#!/usr/bin/env sh


docker exec -it ckdb  sh -c  'mysql  -u ckuser -pCisco@1234 b2b  < /opt/initdb/seed.sql'

docker exec -it ckdb  sh -c  'mysql  -u ckuser -pCisco@1234 b2b -e "show tables;"'
