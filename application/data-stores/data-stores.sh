#!/usr/bin/env bash

option=$1
composer="-f data-stores.yml"

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


setup_data_stores(){
    docker-compose $composer run --rm start_dependencies
    docker-compose $composer run --rm start_dependencies
    docker run -d --name="log-ck" --rm --volume=/var/run/docker.sock:/var/run/docker.sock --publish=127.0.0.1:8989:80 gliderlabs/logspout
}

init_data(){
    sh -c "setup/seed/mongoseed.sh"
    sh -c "setup/seed/mysqlseed.sh"
}

function cleanup(){
    docker-compose $composer down
    docker stop log-ck
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc:ro spotify/docker-gc
    docker volume ls -qf dangling=true | xargs -r docker volume rm
}

case "$option" in
    build)
       echo -n "${green} Building Data Stores Docker Images "
       docker_make
    ;;
    setup)
       echo -n "${green} Setup Data Stores  "
       setup_data_stores
       init_data
    ;;

    clean)
       echo -n "${red} Setup Data Stores "
       cleanup
    ;;

    *)
        echo "${gray} Usage: ./data-stores.sh {build|setup|clean}" >&2
        exit 1
    ;;
esac
exit 0

