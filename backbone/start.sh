#!/usr/bin/env sh

composer=self-hosted.yml

cd base && make && cd ..
cd java && make && cd ..
docker-compose build
docker volume ls -qf dangling=true | xargs -r docker volume rm
docker-compose -f $composer run --rm start_dependencies
sh -c "workers/mysqlseed.sh"
sh -c "workers/mongoseed.sh"
docker-compose -f $composer  up -d
python fcci/app.py &

