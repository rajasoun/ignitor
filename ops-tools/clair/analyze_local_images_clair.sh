#!/usr/bin/env sh

docker run --name="analyze-local-images"  -d  --rm -v `pwd`:/app -w /app  golang:1.8-alpine  /app/entrypoint.sh $1
