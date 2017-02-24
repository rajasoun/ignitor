#!/usr/bin/env sh

composer="$1  -f elk-logspout.yml"
option=$2
DESC="CK "


set -e

case "$option" in
    start)
        echo -n "Starting $DESC: "
        cd base && make && cd ..
        cd java && make && cd ..
        docker-compose -f $composer build
        docker-compose -f $composer run --rm start_dependencies
        sh -c "workers/mongoseed.sh"
        sh -c "workers/mysqlseed.sh"
        docker-compose -f $composer  up -d
        /usr/bin/python  fcci/app.py &
        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc:ro spotify/docker-gc
        docker volume ls -qf dangling=true | xargs -r docker volume rm
    ;;
    stop)
        echo -n "Starting $DESC: "
        docker-compose -f $composer down
        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc:ro spotify/docker-gc
        ps -ef | grep '[p]ython fcci/app.py' | awk '{ print $2 }' | xargs kill
        sleep 2
        echo "fcci/app.py killed."
        docker volume ls -qf dangling=true | xargs -r docker volume rm
    ;;
    *)
        echo "Usage: ./ck.sh {self-hosted.yml|third-party.yml} {start|stop}" >&2
        exit 1
    ;;
esac
exit 0
