#!/usr/bin/env bash

option=$1

# Prepare output colors
red=`tput setaf 1`
green=`tput setaf 10`
blue=`tput setaf 4`
gray=`tput setaf 8`
reset=`tput sgr0`

projects=( base java  python  devtools  wait-for-it ansible )

function docker_make(){
	for project in "${projects[@]}"
	do
	        cd $project
	        echo "Building... $project @ `pwd`"
	        make $1
	        cd ..
	        echo "***Done***"
	done
}
case "$option" in
    build)
       echo -n "${green} Building Core Docker Images "
       docker_make build
    ;;

    clean)
       echo -n "${red} Deleting Core Docker Images "
        docker_make delete-image
    ;;

    *)
        echo "${gray} Usage: ./docker.sh {build|clean}" >&2
        exit 1
    ;;
esac
exit 0

