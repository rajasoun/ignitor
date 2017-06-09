#!/usr/bin/env sh


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
    ;;

    start)
        echo -n "Starting $DESC: "
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
