FROM nginx:alpine

ENV DOCKER_HOST unix:///tmp/docker.sock

ADD vhost.d/default /etc/nginx/vhost.d/default

RUN chown -R nginx:nginx /usr/share/nginx/html/*
RUN chmod -R 0755 /usr/share/nginx/html/*

