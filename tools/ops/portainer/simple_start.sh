#!/usr/bin/env sh

#docker run -d --name portainer -v "/var/run/docker.sock:/var/run/docker.sock" -p 9000:9000 portainer/portainer
docker run -d --name portainer -e VIRTUAL_HOST=dev.xkit.co/portainer  -e VIRTUAL_PORT=9000 -v "/opt/portainer/data:/data" -v "/var/run/docker.sock:/var/run/docker.sock" -p 9000:9000 portainer/portainer
