#!/usr/bin/env sh


docker exec -it ckdb  -u ckuser -pCisco@1234 b2b -e "CREATE DATABASE IF NOT EXISTS b2b;"
docker exec -it ckdb  -u ckuser -pCisco@1234 b2b -e "CREATE user ckuser identified by 'Cisco@1234';"
docker exec -it ckdb  -u ckuser -pCisco@1234 b2b -e "delete from resource;"
docker exec -it ckdb  -u ckuser -pCisco@1234 b2b -e "delete from subject;"
