FROM nginx:alpine

ENV DOCKER_HOST unix:///tmp/docker.sock

ADD vhost.d/default /etc/nginx/vhost.d/default

# Inject files in container file system
COPY rootfs /

