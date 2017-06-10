#!/usr/bin/env sh

option=$1
DESC="Portainer Docker Monitor"
WORKSPACE="$HOME/Workspace/ck/ignitor/"


composer="portainer.yml"
export PORTAINER_HOST=portainer.$(hostname)

controller="ignitor.sh"
getControllerPath() {
    file=$1
    controller=$(find $WORKSPACE -type f -name "*$file*")
}


setUp() {
  getControllerPath $controller
  source $controller
}


set -e
setUp
trap tearDown EXIT

