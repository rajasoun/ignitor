#!/usr/bin/env sh

option=$1
DESC="Nginx Proxy -Autopilot"
WORKSPACE="$HOME/Workspace/ck/ignitor/"

composer="proxy.yml"
#export PORTAINER_HOST=portainer.$(hostname)

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

tearDown() {
    echo "TearDown"
}

set -e
setUp
trap tearDown EXIT

