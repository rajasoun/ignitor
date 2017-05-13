#!/usr/bin/env sh

sh -c "tools/ops/clean/docker-clean all"

## Setup hostlocal.io
docker run --rm --privileged --net=host gliderlabs/hostlocal

## Web Proxy
docker-compose -f web-proxy/proxy.yml up -d --build

##Portainer
docker-compose -f  tools/ops/portainer/portainer.yml  up -d --build

##Docs
docker-compose -f  docs/docs.yml  up -d --build


##Portainer
docker-compose -f  tools/ops/tracker/tracker.yml  up -d --build


