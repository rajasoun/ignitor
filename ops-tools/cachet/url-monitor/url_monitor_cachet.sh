#!/usr/bin/env sh

docker run --name="cachet-url-monitor"  -d  --rm -v `pwd`:/app -w /app  golang:1.8-alpine  /app/entrypoint.sh
