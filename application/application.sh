#!/usr/bin/env sh

option=$1
composer="-f web/web.yml -f services/services.yml -f data-stores/data-stores.yml"
DESC="clks"

build_core_images()  {
    sh -c "core/docker.sh build"
}

clean_base_images() {
    sh -c "core/docker.sh clean"
}

setup_data_stores(){
    docker-compose $composer run --rm start_dependencies
    docker-compose $composer run --rm start_dependencies
    docker run -d --name="log-ck" --rm --volume=/var/run/docker.sock:/var/run/docker.sock --publish=127.0.0.1:8989:80 gliderlabs/logspout
}


init_data(){
    sh -c "data-stores/setup/seed/mongoseed.sh"
    sh -c "data-stores/setup/seed/mysqlseed.sh"
}

cleanup(){
    docker volume ls -qf dangling=true | xargs -r docker volume rm
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc:ro spotify/docker-gc
    docker volume ls -qf dangling=true | xargs -r docker volume rm
}

setup_hostlocal(){
    docker run --rm --privileged --net=host gliderlabs/hostlocal
}


set -e

case "$option" in
    setup)
       echo -n "Setup $DESC "
       echo -n "+++ docker-compose $composer +++"
       docker network create $DESC
       build_core_images
       setup_data_stores
       init_data
       clean_base_images
       cleanup
       setup_hostlocal #To Enable hostlocal.io
    ;;

    start)
        echo -n "Starting $DESC: "
        docker-compose $composer  up -d
        sh -c "services/setup/setupdev.sh"
    ;;

    stop)
        echo -n "Stopping $DESC: "
        docker-compose $composer down
    ;;

    teardown)
        echo -n "TearDown $DESC: "
        docker-compose $composer down
        docker network rm $DESC
        docker network prune
        docker stop log-ck
        docker rm -v log-ck
        cleanup
        sudo ip addr del 169.254.255.254/24 dev lo:0
    ;;

    log)
        curl http://127.0.0.1:8989/logs
    ;;
    *)
        echo "Usage: ./application.sh {setup|start|stop|teardown|log}" >&2
        exit 1
    ;;
esac
exit 0
