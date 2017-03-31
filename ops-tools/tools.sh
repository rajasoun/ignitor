#!/usr/bin/env sh

composer="-f portainer-compose/docker-compose.yml -f cachet/server/docker-compose.yml  "
DESC="clks-ops"
option=$1

# Prepare output colors
red=`tput setaf 1`
green=`tput setaf 10`
blue=`tput setaf 4`
gray=`tput setaf 8`
reset=`tput sgr0`

cleanup(){
    docker volume ls -qf dangling=true | xargs -r docker volume rm
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc:ro spotify/docker-gc
    docker volume ls -qf dangling=true | xargs -r docker volume rm
}

set -e

case "$option" in
    setup)
       echo -n "${green} Setup $DESC "
       echo -n "${green} +++ docker-compose $composer +++"
       docker network create $DESC
       docker run -d --name="log-ops" --rm --volume=/var/run/docker.sock:/var/run/docker.sock --publish=127.0.0.1:9898:80 gliderlabs/logspout
       docker-compose $composer  build
       cleanup
    ;;

    start)
        echo -n "${green} Starting $DESC: "
        docker-compose $composer  up -d
    ;;

    stop)
        echo -n "${gray} Stopping $DESC: "
        docker-compose $composer down
    ;;

    teardown)
        echo -n "${red} TearDown $DESC: "
        docker-compose $composer down
        docker network rm $DESC
        docker network prune
        docker stop log-ops
        docker rm -v log-ops
        cleanup
        sudo ip addr del 169.254.255.254/24 dev lo:0
    ;;

    log)
        curl http://127.0.0.1:9898/logs
    ;;
    *)
        echo "${blue} Usage: ./tools.sh {setup|start|stop|teardown|log}" >&2
        exit 1
    ;;
esac
exit 0
