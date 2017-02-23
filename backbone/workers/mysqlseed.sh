#!/usr/bin/env sh

echo "Grant Privilages & Schema Creation For Auth"
docker exec -it ckdb  sh -c  'mysql  -u root   -ppassword@1234   < /initdb/grant.sql'
docker exec -it ckdb  sh -c  'mysql  -u ckuser -pCisco@1234    b2b  < /initdb/schema.sql'
docker exec -it ckdb  sh -c  'mysql  -u ckuser -pCisco@1234    b2b -e "show tables;"'
