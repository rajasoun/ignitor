#!/usr/bin/env sh

sh -c "tools/ops/clean/docker-clean all"

## Setup hostlocal.io
docker run --rm --privileged --net=host gliderlabs/hostlocal

##Portainer
docker-compose -f  tools/ops/portainer/portainer.yml  up -d --build

##Docs
docker-compose -f  docs/docs.yml  up -d --build


##Portainer
docker-compose -f  tools/ops/tracker/tracker.yml  up -d --build

## Web Proxy
docker-compose -f web-proxy/proxy.yml up -d --build


## Unified Log
docker run -d --name="log-ck" --rm --volume=/var/run/docker.sock:/var/run/docker.sock --publish=127.0.0.1:8989:80 gliderlabs/logspout

curl http://127.0.0.1:8989/logs

