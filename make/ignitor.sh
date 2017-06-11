#!/usr/bin/env sh

# Prepare output colors
red=`tput setaf 1`
green=`tput setaf 10`
blue=`tput setaf 4`
gray=`tput setaf 8`
reset=`tput sgr0`

NGINX_PROXY_NET="nginx-proxy"

createNginxProxyNetwork() {
    nginx_proxy_net_defined=$(docker network list | grep $NGINX_PROXY_NET | wc -l)
    if [ $nginx_proxy_net_defined -eq 0 ]; then
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
       echo  "${blue}  Setup $DESC " >&2
       createNginxProxyNetwork
       setup_hostlocal #To Enable hostlocal.io
    ;;

    start)
        echo  "${green}  Start $DESC " >&2
        createNginxProxyNetwork
        docker-compose -f $composer up -d  --build
    ;;

    stop)
        echo  "${red}  Stop $DESC  " >&2
        docker-compose -f $composer down
    ;;

    teardown)
        echo  "${red}  Teardown $DESC " >&2
        docker-compose -f $composer down
        cleanup
    ;;

    ps)
        echo  "${green}  $DESC Status" >&2
        docker-compose -f $composer ps
    ;;

    logs)
        docker-compose -f $composer logs -f
    ;;
    *)
        script=$(basename $0)
        echo  "${gray} Usage: $script {setup|start|stop|teardown|ps|logs}" >&2
        exit 1
    ;;
esac
exit 0
