#!/usr/bin/env sh

sh -c "tools/ops/clean/docker-clean all"
docker-compose -f  tools/ops/portainer/portainer.yml  build
docker-compose -f  tools/ops/portainer/portainer.yml  up -d
cd web-proxy
sh -c "proxy.sh setup"
sh -c "proxy.sh start"
