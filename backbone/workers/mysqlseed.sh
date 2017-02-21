#!/usr/bin/env sh


docker exec -it ckdb mysql  -u ckuser -pCisco@1234 b2b -e  "CREATE DATABASE b2b;"
docker exec -it ckdb mysql  -u ckuser -pCisco@1234 b2b -e  "CREATE USER 'ckuser'@'localhost' IDENTIFIED BY 'Cisco@1234';"
docker exec -it ckdb mysql  -u ckuser -pCisco@1234 b2b -e  "GRANT ALL PRIVILEGES ON * . * TO 'ckuser'@'localhost';"
docker exec -it ckdb mysql  -u ckuser -pCisco@1234 b2b -e  "CREATE USER 'ckuser'@'%' IDENTIFIED BY 'Cisco@1234';"
docker exec -it ckdb mysql  -u ckuser -pCisco@1234 b2b -e  "GRANT ALL PRIVILEGES ON * . * TO 'ckuser'@'%';"

docker exec -it ckdb mysql  -u ckuser -pCisco@1234 b2b -e "DELETE FROM RESOURCE;"
docker exec -it ckdb mysql  -u ckuser -pCisco@1234 b2b -e "DELETE FROM SUBJECT;"
