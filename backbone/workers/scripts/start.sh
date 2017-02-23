#!/usr/bin/env sh

echo "Switching to Docker App Directory"
cd /app
server_target="$1-server"
jetty="com.cisco.ccl.b2b.$1.server.JettyServer"
port=$2
war="$1-web/target/$3.war"
app=$3

echo "Starting $app ...."
export JAVA_OPTS="-Xms512m -Xmx1024m -javaagent:$server_target/target/aspectjweaver-1.7.4.jar -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=8202"
java ${JAVA_OPTS} -cp $CLASSPATH:$server_target/target/server-jar-with-dependencies.jar $jetty $port $war $app
echo "***Done***"


