#!/usr/bin/env sh

DESC="clks-ops"
option=$1
tools_path=ops

# Prepare output colors
red=`tput setaf 1`
green=`tput setaf 10`
blue=`tput setaf 4`
gray=`tput setaf 8`
reset=`tput sgr0`

set -e

case "$option" in
    setup)
       echo -n "${green} Setup $DESC\n "
       docker network create $DESC
       docker run -d --name="log-ops" --rm --volume=/var/run/docker.sock:/var/run/docker.sock --publish=127.0.0.1:9898:80 gliderlabs/logspout
       docker-compose -f $tools_path/portainer/portainer.yml  up -d  --build
       docker-compose -f $tools_path/cachet/server/cachet-server.yml  up -d --build
       #Removes all stopped containers, untagged images, dangling volumes, and networks
       sh -c "$tools_path/clean/docker-clean run"
    ;;

    start)
        echo -n "${green} Starting $DESC: "
        docker-compose -f $tools_path/portainer/portainer.yml  start
        docker-compose -f $tools_path/cachet/server/cachet-server.yml  start
    ;;

    stop)
        echo -n "${gray} Stopping $DESC: "
        docker-compose -f $tools_path/portainer/portainer.yml  stop
        docker-compose -f $tools_path/cachet/server/cachet-server.yml  stop
    ;;

    teardown)
        echo -n "${red} TearDown $DESC: "
        docker-compose -f $tools_path/portainer/portainer.yml  down
        docker-compose -f $tools_path/cachet/server/cachet-server.yml  down
        #Stops and removes all containers, cleans dangling volumes, and networks
        sh -c "$tools_path/clean/docker-clean stop"
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
