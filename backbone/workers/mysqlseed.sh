#!/usr/bin/env sh

MARIADB_USER=ckuser
MARIADB_DATABASE=b2b

echo "Grating access for $MARIADB_USER to $MARIADB_DATABASE"
docker exec -it ckdb  sh -c  'mysql  -u root -ppassword@1234 "GRANT ALL ON *.* TO '$MARIADB_USER'@'%' ;FLUSH PRIVILEGES;"'
docker exec -it ckdb  sh -c  'mysql  -u root -ppassword@1234 "GRANT ALL ON *.* TO '$MARIADB_USER'@'localhost' ;FLUSH PRIVILEGES;"'
docker exec -it ckdb  sh -c  'mysql  -u root -ppassword@1234 "GRANT ALL ON $MARIADB_DATABASE.* TO '$MARIADB_USER'@'%' ;FLUSH PRIVILEGES;"'
docker exec -it ckdb  sh -c  ' mysql  -u root -ppassword@1234 "GRANT ALL ON $MARIADB_DATABASE.* TO '$MARIADB_USER'@'localhost' ;FLUSH PRIVILEGES;"'

echo "Schema Creation For Auth"
docker exec -it ckdb  sh -c  'mysql  -u ckuser -pCisco@1234 b2b  < initdb/seed.sql'
docker exec -it ckdb  sh -c  'mysql  -u ckuser -pCisco@1234 b2b -e "show tables;"'
