#!/usr/bin/env sh

option=$1
composer="-f proxy.yml"
DESC="Proxy Controller"

start_nginx_proxy(){
    docker run --rm -d -p 80:80 -p 443:443 \
        --name nginx-proxy \
        --net reverse-proxy \
        -v $HOME/certs:/etc/nginx/certs:ro \
        -v /etc/nginx/vhost.d \
        -v /usr/share/nginx/html \
        -v /var/run/docker.sock:/tmp/docker.sock:ro \
        --label com.github.jrcs.letsencrypt_nginx_proxy_companion.nginx_proxy=true \
    jwilder/nginx-proxy
}

start_nginx_letsencrypt(){
    docker run --rm -d \
        --name nginx-letsencrypt \
        --net reverse-proxy \
        --volumes-from nginx-proxy \
        -v $HOME/certs:/etc/nginx/certs:rw \
        -v /var/run/docker.sock:/var/run/docker.sock:ro \
    jrcs/letsencrypt-nginx-proxy-companion
}

cleanup(){
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc:ro spotify/docker-gc
}

set -e

case "$option" in
    setup)
       echo -n "Setup $DESC "
       docker network create --driver bridge reverse-proxy
    ;;

    start)
        echo -n "Starting $DESC: "
        docker network create --driver bridge reverse-proxy
        start_nginx_proxy
        start_nginx_letsencrypt
    ;;

    stop)
        echo -n "Stopping $DESC: "
        docker stop nginx-proxy nginx-letsencrypt
        docker network rm reverse-proxy
    ;;

    teardown)
        echo -n "TearDown $DESC: "
        docker network rm reverse-proxy
        cleanup
    ;;

    *)
        echo "Usage: ./proxy.sh {setup|start|stop|teardown}" >&2
        exit 1
    ;;
esac
exit 0
