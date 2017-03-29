#!/usr/bin/env sh

composer="-f portainer-compose/docker-compose.yml -f cachet/docker-compose.yml  "
DESC="CLKS-OPS"
option=$1

cleanup(){
    docker volume ls -qf dangling=true | xargs -r docker volume rm
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc:ro spotify/docker-gc
    docker volume ls -qf dangling=true | xargs -r docker volume rm
}

set -e

case "$option" in
    setup)
       echo -n "Setup $DESC "
       echo -n "+++ docker-compose $composer +++"
       docker network create $DESC
       docker run -d --name="log-ops" --rm --volume=/var/run/docker.sock:/var/run/docker.sock --publish=127.0.0.1:9898:80 gliderlabs/logspout
       docker-compose $composer  build
       cleanup
    ;;

    start)
        echo -n "Starting $DESC: "
        docker-compose $composer  up -d
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
        docker stop log-ops
        docker rm -v log-ops
        cleanup
        sudo ip addr del 169.254.255.254/24 dev lo:0
    ;;

    log)
        curl http://127.0.0.1:9898/logs
    ;;
    *)
        echo "Usage: ./tools.sh {setup|start|stop|teardown|log}" >&2
        exit 1
    ;;
esac
exit 0
