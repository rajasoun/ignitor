#!/usr/bin/env sh

cleanup(){
    sh -c "tools/ops/clean/docker-clean all"
    #sudo ip addr del 169.254.255.254/24 dev lo:0
}

setup_hostlocal(){
    docker run --rm --privileged --net=host gliderlabs/hostlocal
}

setUp() {
    cleanup
    sh -c "proxy/proxy.sh start"
    #sh -c "tools/ops/portainer/portainer.sh start"
    #docker-compose -f application/core/core.yml build nginx-static
    #sh -c "tools/site/site.sh start"
    #docker-compose -f  docs/docs.yml  up -d --build
    ## Unified Log
    docker run -d --name="log-ck" --rm \
        --volume=/var/run/docker.sock:/var/run/docker.sock \
        --publish=127.0.0.1:8989:80 gliderlabs/logspout
}

tearDown() {
    curl http://127.0.0.1:8989/logs
}

setup_hostlocal
set -e
setUp
trap tearDown EXIT


