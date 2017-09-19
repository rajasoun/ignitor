#!/usr/bin/env sh

option=$1
DESC="StatsD Docker "
WORKSPACE="$HOME/Workspace/ck/ignitor"


composer="statsd.yml"
export STATSD_HOST=statsd.$(hostname)

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

