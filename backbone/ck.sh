#!/usr/bin/env sh

composer=$1
option=$2
DESC="CK "


set -e

case "$option" in
    start)
        echo -n "Starting $DESC: "
        cd base && make && cd ..
        cd java && make && cd ..
        docker-compose -f $composer build
        docker volume ls -qf dangling=true | xargs -r docker volume rm
        docker-compose -f $composer run --rm start_dependencies
        sh -c "workers/mysqlseed.sh"
        sh -c "workers/mongoseed.sh"
        docker-compose -f $composer  up -d
        /usr/bin/python  fcci/app.py &
    ;;
    stop)
        echo -n "Starting $DESC: "
        docker-compose -f $composer down
        docker volume ls -qf dangling=true | xargs -r docker volume rm
        docker_gc_vol="~/Workspace/ck/devbox-docker/backbone/workers/dockergc/etc/"
        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v $docker_gc_vol:/etc:ro spotify/docker-gc
        pid=`ps -ef | grep '[p]ython fcci/app.py' | awk '{ print $2 }' | xargs kill`
        echo $pid
        sleep 2
        echo "fcci/app.py killed."
    ;;
    *)
        echo "Usage: ./ck.sh {self-hosted.yml|third-party.yml} {start|stop}" >&2
        exit 1
    ;;
esac
exit 0
