#!/usr/bin/env sh

option=$1
composer="-f tracker.yml"
DESC="tracker"

cleanup(){
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc:ro spotify/docker-gc
}


setup_hostlocal(){
    docker run --rm --privileged --net=host gliderlabs/hostlocal
}



set -e

case "$option" in
    setup)
       echo -n "Setup $DESC "
       setup_hostlocal #To Enable hostlocal.io
    ;;

    start)
        echo -n "Starting $DESC: "
        docker-compose $composer run --rm start_dependencies
        docker-compose $composer up -d  --build
    ;;

    stop)
        echo -n "Stopping $DESC: "
        docker-compose $composer down
        docker volume rm tracker_db-data tracker_site-data
    ;;

    teardown)
        echo -n "TearDown $DESC: "
        docker-compose $composer down
        cleanup
    ;;

    log)
        docker-compose $composer logs -f
    ;;
    *)
        echo "Usage: ./tracker.sh {setup|start|stop|teardown|log}" >&2
        exit 1
    ;;
esac
exit 0
