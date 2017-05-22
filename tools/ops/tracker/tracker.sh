#!/usr/bin/env sh

option=$1
composer="-f tracker.yml"
DESC="tracker"

cleanup(){
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc:ro spotify/docker-gc
}

setup_ssl_certificate(){
    ansible-vault decrypt \
        ~/Workspace/ck/ignitor/tools/ops/tracker/tasks/rootfs/etc/cont-init.d/11-00-configure-wordpress \
        --vault-password-file ~/Workspace/ck/ignitor/.vault_pass
}

setup_hostlocal(){
    docker run --rm --privileged --net=host gliderlabs/hostlocal
}

teardown_ssl_certificate(){
    git reset --hard
}



set -e

case "$option" in
    setup)
       echo -n "Setup $DESC "
       setup_hostlocal #To Enable hostlocal.io
    ;;

    start)
        echo -n "Starting $DESC: "
        setup_ssl_certificate ##Secret File  .vault_pass is required
        docker-compose $composer run --rm start_dependencies
        docker-compose $composer up -d  --build
        teardown_ssl_certificate
    ;;

    stop)
        echo -n "Stopping $DESC: "
        docker-compose $composer down
        docker volume rm tracker_db-data tracker_site-data
    ;;

    teardown)
        echo -n "TearDown $DESC: "
        docker-compose $composer down
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
