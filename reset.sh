#!/usr/bin/env sh

sh -c "tools/ops/clean/docker-clean all"
docker-compose -f  tools/ops/portainer/portainer.yml  build
docker-compose -f  tools/ops/portainer/portainer.yml  up -d
