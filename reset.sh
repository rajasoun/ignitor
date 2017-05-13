#!/usr/bin/env sh

sh -c "tools/ops/clean/docker-clean all"

cd web-proxy
./proxy.sh start
cd -

## Setup hostlocal.io
docker run --rm --privileged --net=host gliderlabs/hostlocal
docker-compose -f  tools/ops/portainer/portainer.yml  up -d --build
docker-compose -f  docs/docs.yml  up -d --build
docker-compose -f  tools/ops/tracker/tracker.yml  up -d --build

## Unified Log
docker run -d --name="log-ck" --rm --volume=/var/run/docker.sock:/var/run/docker.sock --publish=127.0.0.1:8989:80 gliderlabs/logspout

curl http://127.0.0.1:8989/logs

