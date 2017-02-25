#!/usr/bin/env sh

docker run -d --name="log" --rm --volume=/var/run/docker.sock:/var/run/docker.sock --publish=127.0.0.1:8989:80 gliderlabs/logspout
curl http://127.0.0.1:8989/logs
