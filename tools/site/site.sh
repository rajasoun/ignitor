#!/usr/bin/env sh

option=$1
composer="site.yml"
DESC="Tracker Static Site"
export STATIC_HOST=web.$(hostname)

controller="ignitor.sh"
getControllerPath() {
    file=$1
    WORKSPACE="$HOME/Workspace/ck/ignitor/"
    controller=$(find $WORKSPACE -type f -name "*$file*")
}

getControllerPath $controller
source $controller
