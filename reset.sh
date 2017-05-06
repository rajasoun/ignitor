#!/usr/bin/env sh

sh -c "tools/ops/clean/docker-clean all"
docker-compose -f  tools/ops/portainer/portainer.yml  build
docker-compose -f  tools/ops/portainer/portainer.yml  up -d

#sh -c "web-proxy/proxy.sh setup"
#sh -c "web-proxy/proxy.sh start"
#
#sh -c "docs/docs.sh setup"
#sh -c "docs/docs.sh start"

