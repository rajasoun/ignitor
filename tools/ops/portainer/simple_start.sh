#!/usr/bin/env sh

docker run -d --name portainer -v "/var/run/docker.sock:/var/run/docker.sock" -p 9000:9000 portainer/portainer
