#!/usr/bin/env sh

cd base && make && cd ..
cd java && make && cd ..
docker-compose build
docker-compose run --rm start_dependencies
docker-compose up -d

