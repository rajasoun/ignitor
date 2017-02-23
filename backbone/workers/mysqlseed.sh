#!/usr/bin/env sh

echo "Grant Privilages & Schema Creation For Auth"
docker exec -it -v $(pwd):/app ckdb  sh -c  'mysql  -u ckuser -pCisco@1234 b2b  < /app/initdb/seed.sql'
docker exec -it ckdb  sh -c  'mysql  -u ckuser -pCisco@1234 b2b -e "show tables;"'
