FROM nginx:alpine

ENV DOCKER_HOST unix:///tmp/docker.sock

ADD vhost.d/default /etc/nginx/vhost.d/default

#VOLUME ["/etc/nginx/conf.d"]
#VOLUME ["/etc/nginx/vhost.d"]
#VOLUME ["/usr/share/nginx/html"]
#VOLUME ["/etc/nginx/certs"]
