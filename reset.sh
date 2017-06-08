#!/usr/bin/env sh

### Complete CleanUp ###
sh -c "tools/ops/clean/docker-clean all"

### Dynamic Nginx Proxy  ###
sh -c "proxy/proxy-controller.sh setup"
sh -c "proxy/proxy-controller.sh start"

docker-compose -f  tools/ops/portainer/portainer.yml  up -d --build
#docker-compose -f  tools/static-site/tracker.learn.cisco.yml up -d --build
#docker-compose -f  docs/docs.yml  up -d --build

## Unified Log
docker run -d --name="log-ck" --rm --volume=/var/run/docker.sock:/var/run/docker.sock --publish=127.0.0.1:8989:80 gliderlabs/logspout

curl http://127.0.0.1:8989/logs

