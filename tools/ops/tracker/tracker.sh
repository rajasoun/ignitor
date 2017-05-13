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


teardown_hostlocal(){
    sudo ip addr del 169.254.255.254/24 dev lo:0
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
        docker-compose $composer  up -d  --build
        docker exec -it tracker_tasks_1 wp core install --path=/usr/src/wordpress/ --url=https://tracker.learn.cisco/tasks --title="Tracker" --admin_user=admin --admin_password=vziMjlWd3^RoZRO%i# --admin_email=rajasoun@icloud.com
    ;;

    stop)
        echo -n "Stopping $DESC: "
        docker-compose $composer down
    ;;

    teardown)
        echo -n "TearDown $DESC: "
        docker-compose $composer down
        teardown_hostlocal
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
