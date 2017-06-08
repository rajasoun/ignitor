#!/usr/bin/env sh


sh -c "tools/ops/clean/docker-clean all"
sh -c "proxy/proxy-controller.sh reset"
sh -c "tools/ops/portainer/portainer.sh start"
sh -c "tools/static-site/static-site.sh start"

#docker-compose -f  docs/docs.yml  up -d --build

## Unified Log
docker run -d --name="log-ck" --rm --volume=/var/run/docker.sock:/var/run/docker.sock --publish=127.0.0.1:8989:80 gliderlabs/logspout

curl http://127.0.0.1:8989/logs

