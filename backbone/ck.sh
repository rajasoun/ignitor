#!/usr/bin/env sh

composer=$1
test –f $composer || exit 0

case “$2” in
    start)
            echo –n “Starting CK:”
            cd base && make && cd ..
            cd java && make && cd ..
            docker-compose -f $composer build
            docker volume ls -qf dangling=true | xargs -r docker volume rm
            docker-compose -f $composer run --rm start_dependencies
            sh -c "workers/mysqlseed.sh"
            sh -c "workers/mongoseed.sh"
            docker-compose -f $composer  up -d
            echo “.”
            ;;
   stop)
          echo –n “Stopping CK”
          docker-compose -f $composer  down
          echo “.”
           ;;
      *)
          echo “Usage: ck.sh third-party.yml|self-hosted.yml start|stop ”
          exit 1
          ;;
    esac
