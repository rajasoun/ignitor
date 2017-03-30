#!/usr/bin/env sh
### https://github.com/coreos/clair/tree/master/contrib/analyze-local-images
# Go To Be Available On Local System
# go get -u github.com/coreos/clair/contrib/analyze-local-images
images=$(docker images -q)

for image in $images
do
    analyze-local-images  $image
done
