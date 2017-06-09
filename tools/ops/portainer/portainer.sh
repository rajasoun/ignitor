#!/usr/bin/env sh


option=$1
composer="portainer.yml"
DESC="Tracker Static Site"
export PORTAINER_HOST=portainer.$(hostname)

controller="ignitor.sh"
getControllerPath() {
    file=$1
    WORKSPACE="$HOME/Workspace/ck/ignitor/"
    controller=$(find $WORKSPACE -type f -name "*$file*")
}

getControllerPath $controller
source $controller

