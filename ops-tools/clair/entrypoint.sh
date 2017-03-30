#!/usr/bin/env sh

apk add --no-cache git
go get -u github.com/coreos/clair/contrib/analyze-local-images
apk del git
analyze-local-images $1


