#!/usr/bin/env sh

option=$1
composer="-f proxy.yml"
DESC="Proxy Controller"

create_net(){
    net_count=$(docker network  ls | grep reverse-proxy | wc -l)
    if [ $net_count = 0 ]
    then
        docker network create --driver bridge reverse-proxy
    fi
}

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
    net_count=$(docker network  ls | grep reverse-proxy | wc -l)
    if [ $net_count = 1 ]
    then
        docker network rm reverse-proxy
    fi
}

set -e

case "$option" in
    start)
        echo -n "Starting $DESC: "
        create_net
        start_nginx_proxy
        start_nginx_letsencrypt
    ;;

    stop)
        echo -n "Stopping $DESC: "
        docker stop nginx-proxy nginx-letsencrypt
        docker network rm reverse-proxy
    ;;

    reset)
        cleanup
        echo -n "Reset $DESC: "
        create_net
        start_nginx_proxy
        start_nginx_letsencrypt
    ;;
    *)
        echo "Usage: ./proxy.sh {start|stop|reset}" >&2
        exit 1
    ;;
esac
exit 0
