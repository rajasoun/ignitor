#!/usr/bin/env sh

composer="-f portainer/cachet-server.yml -f cachet/server/cachet-server.yml  "
DESC="clks-ops"
option=$1

# Prepare output colors
red=`tput setaf 1`
green=`tput setaf 10`
blue=`tput setaf 4`
gray=`tput setaf 8`
reset=`tput sgr0`

set -e

case "$option" in
    setup)
       echo -n "${green} Setup $DESC "
       echo -n "${green} +++ docker-compose $composer +++"
       docker network create $DESC
       docker run -d --name="log-ops" --rm --volume=/var/run/docker.sock:/var/run/docker.sock --publish=127.0.0.1:9898:80 gliderlabs/logspout
       docker-compose $composer  build
       #Removes all stopped containers, untagged images, dangling volumes, and networks
       sh -c "clean/docker-clean run"
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
        #Stops and removes all containers, cleans dangling volumes, and networks
        sh -c "clean/docker-clean stop"
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
