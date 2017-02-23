#!/usr/bin/env sh

cd base && make && cd ..
cd java && make && cd ..
docker-compose build
docker volume ls -qf dangling=true | xargs -r docker volume rm
docker-compose run --rm start_dependencies
sh -c "workers/mysqlseed.sh"
sh -c "workers/mongoseed.sh"
docker-compose up -d
python fcci/app.py &

