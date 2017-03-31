#!/usr/bin/env bash

projects=( base java  python  devtools   wait-for-it ansible )

for project in "${projects[@]}"
do
        cd $project
        echo "Building... $project @ `pwd`"
        make
        cd ..
        echo "***Done***"
done
