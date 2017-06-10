#!/usr/bin/env sh

NGINX_PROXY_NET="reverse-proxy"

createNginxProxyNetwork() {
    nginx_proxy_net_defined=$(docker network list | grep $NGINX_PROXY_NET | wc -l)
    if [ "$nginx_proxy_net_defined" = "0" ]; then
        docker network create -d bridge \
            --subnet 172.28.0.0/16 \
            --opt com.docker.network.bridge.name=$NGINX_PROXY_NET $NGINX_PROXY_NET
    fi
}

getPath() {
    file=$1
    exclusion_filter=$2
    composer=$(find $PWD -type f -name "*$file*"  | grep -v $exclusion_filter)
}

cleanup(){
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc:ro spotify/docker-gc
}

setup_hostlocal(){
    docker run --rm --privileged --net=host gliderlabs/hostlocal
}

set -e
getPath $composer scratchpad

case "$option" in
    setup)
       echo -n "Setup $DESC "
       setup_hostlocal #To Enable hostlocal.io
       createNginxProxyNetwork
    ;;

    start)
        echo -n "Starting $DESC: "
        createNginxProxyNetwork
        docker-compose -f $composer up -d  --build
    ;;

    stop)
        echo -n "Stopping $DESC: "
        docker-compose -f $composer down
    ;;

    teardown)
        echo -n "TearDown $DESC: "
        docker-compose -f $composer down
        cleanup
    ;;

    logs)
        docker-compose -f $composer logs -f
    ;;
    *)
        script=$(basename $0)
        echo "Usage: $script {setup|start|stop|teardown|logs}" >&2
        exit 1
    ;;
esac
exit 0
