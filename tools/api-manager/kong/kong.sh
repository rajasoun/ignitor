#!/usr/bin/env sh

option=$1
DESC="Kong API Manager"
WORKSPACE="$HOME/Workspace/ck/ignitor/"


composer="kong.yml"
export KONG_HOST=api.$(hostname)

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

