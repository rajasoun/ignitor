#!/usr/bin/env bash

option=$1

# Prepare output colors
red=`tput setaf 1`
green=`tput setaf 10`
blue=`tput setaf 4`
gray=`tput setaf 8`
reset=`tput sgr0`

projects=( elasticsearch mariadb mongodb )

function docker_make(){
	for project in "${projects[@]}"
	do
	        cd $project
	        echo "Building... $project @ `pwd`"
	        make build
	        cd ..
	        echo "***Done***"
	done
}

function cleanup(){
    docker volume ls -qf dangling=true | xargs -r docker volume rm
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc:ro spotify/docker-gc
    docker volume ls -qf dangling=true | xargs -r docker volume rm
}


case "$option" in
    build)
       echo -n "${green} Building Core Docker Images "
       docker_make
    ;;

    clean)
       echo -n "${red} Deleting Core Docker Images "
       cleanup
    ;;

    *)
        echo "${gray} Usage: ./data-stores.sh {build|clean}" >&2
        exit 1
    ;;
esac
exit 0

