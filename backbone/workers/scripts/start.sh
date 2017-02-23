#!/usr/bin/env sh

cd /app
server_target=$1
jetty=$2
port=$3
war=$4
app=$5
export JAVA_OPTS="-Xms512m -Xmx1024m -javaagent:$server_target/target/aspectjweaver-1.7.4.jar -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=8202"
java ${JAVA_OPTS} -cp $CLASSPATH:$server_target/target/server-jar-with-dependencies.jar $jetty $port $war $app

