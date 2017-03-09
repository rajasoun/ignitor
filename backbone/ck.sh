#!/usr/bin/env sh

composer="-f $1 -f elk-logspout.yml -f fcci.yml"
option=$2
DESC="CK "


set -e

case "$option" in
    start)
        echo -n "Starting $DESC: "
        cd base && make && cd ..
        cd java && make && cd ..
        cd python && make && cd ..
        docker-compose $composer build
        docker-compose $composer run --rm start_dependencies
        sh -c "workers/mongoseed.sh"
        sh -c "workers/mysqlseed.sh"
        docker run --rm --privileged --net=host gliderlabs/hostlocal #To Enable hostlocal.io
        docker-compose $composer  up -d
        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc:ro spotify/docker-gc
        docker volume ls -qf dangling=true | xargs -r docker volume rm
        sh -c "workers/setupdev.sh"
    ;;
    stop)
        echo -n "Starting $DESC: "
        docker-compose $composer down
        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc:ro spotify/docker-gc
        docker volume ls -qf dangling=true | xargs -r docker volume rm
    ;;
    *)
        echo "Usage: ./ck.sh {self-hosted.yml|third-party.yml} {start|stop}" >&2
        exit 1
    ;;
esac
exit 0
