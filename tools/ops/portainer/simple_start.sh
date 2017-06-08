#!/usr/bin/env sh

docker run  --rm -d \
    --name portainer \
    --net reverse-proxy \
    -e 'LETSENCRYPT_EMAIL=rajasoun@icloud.com' \
    -e 'LETSENCRYPT_HOST=portainer.myck.io' \
    -e 'VIRTUAL_HOST=portainer.myck.io' \
    -e 'VIRTUAL_PORT=9000' \
    -v "/var/run/docker.sock:/var/run/docker.sock" \
    -p 9000:9000 \
    portainer/portainer

    #    -v "/opt/portainer/data:/data" \
