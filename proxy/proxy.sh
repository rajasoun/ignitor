#!/usr/bin/env sh

option=$1
composer="-f proxy.yml"
DESC="Proxy"

cleanup(){
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc:ro spotify/docker-gc
}

setup_ssl_certificate(){
    ansible-vault decrypt \
        ~/Workspace/ck/ignitor/proxy/certs/tracker.learn.cisco-selfsign.* \
        --vault-password-file ~/Workspace/ck/ignitor/.vault_pass
}

teardown_ssl_certificate(){
    git reset --hard
}

setup_hostlocal(){
    docker run --rm --privileged --net=host gliderlabs/hostlocal
}



set -e

case "$option" in
    setup)
       echo -n "Setup $DESC "
       setup_hostlocal #To Enable hostlocal.io
    ;;

    start)
        echo -n "Starting $DESC: "
        #docker network create nginx-net
        setup_ssl_certificate ##Secret File  .vault_pass is required
        docker network create --driver bridge reverse-proxy
        docker-compose $composer up -d  --build
        teardown_ssl_certificate
    ;;

    stop)
        echo -n "Stopping $DESC: "
        docker-compose $composer down
        docker network rm reverse-proxy
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
        echo "Usage: ./proxy.sh {setup|start|stop|teardown|log}" >&2
        exit 1
    ;;
esac
exit 0
