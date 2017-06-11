#!/usr/bin/env sh

option=$1
DESC="Static Web Site"
WORKSPACE="$HOME/Workspace/ck/ignitor/"

composer="site.yml"
export SITE_HOST=$(hostname)

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
