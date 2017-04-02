#!/usr/bin/env sh

cd  tools/ops/portainer;git remote add upstream https://github.com/portainer/portainer-compose;git fetch upstream;git pull upstream master;cd -
