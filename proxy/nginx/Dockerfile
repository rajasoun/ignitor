FROM nginx:alpine

ENV DOCKER_HOST unix:///tmp/docker.sock

RUN mkdir -p /etc/nginx/html/.well-known/acme-challenge/

ADD vhost.d/default /etc/nginx/vhost.d/default
ADD html/index.html /etc/nginx/html/.well-known/acme-challenge/index.html

