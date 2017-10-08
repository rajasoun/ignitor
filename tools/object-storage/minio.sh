#!/usr/bin/env sh

option=$1
DESC="Minio Object Storage - S3 Compatible"
WORKSPACE="$HOME/Workspace/ck/ignitor/"


composer="minio.yml"
export MINIO_HOST=s3.$(hostname)

controller="ignitor.sh"
getControllerPath() {
    file=$1
    controller=$(find $WORKSPACE -type f -name "*$file*")
}


setUp() {
  getControllerPath $controller
  # Source The Controller Script
  . $controller
}


set -e
setUp
trap tearDown EXIT

