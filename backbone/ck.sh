#!/usr/bin/env sh

composer="-f $1 -f elk-logspout.yml -f fcci.yml"
option=$2
DESC="CLKS "

build_images()  {
    cd base && make && cd ..
    cd java && make && cd ..
    cd python && make && cd ..
    docker-compose $composer build
}

init_data(){
    sh -c "workers/mongoseed.sh"
    sh -c "workers/mysqlseed.sh"
}

setup_ck_backbone(){
    docker-compose $composer run --rm start_dependencies
    docker-compose $composer run --rm start_dependencies
    docker run -d --name="log" --rm --volume=/var/run/docker.sock:/var/run/docker.sock \
                                --publish=127.0.0.1:8989:80 gliderlabs/logspout
}

cleanup(){
    docker rm -v ckos java python
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
       build_images
       setup_ck_backbone
       init_data
       cleanup
       setup_hostlocal #To Enable hostlocal.io
    ;;

    start)
        echo -n "Starting $DESC: "
        docker-compose $composer  up -d
        sh -c "workers/setupdev.sh"
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
        cleanup
    ;;

    log)
        curl http://127.0.0.1:8989/logs
    ;;
    *)
        echo "Usage: ./ck.sh {self-hosted.yml|third-party.yml} {setup|start|stop|teardown|log}" >&2
        exit 1
    ;;
esac
exit 0
