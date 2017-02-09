#!/bin/ash
log() {
	printf "[INFO] preStart: %s\n" "$@"
}
loge() {
	printf "[ERR] preStart: %s\n" "$@"
}

# Update configuration file
update_ES_configuration() {
	REPLACEMENT_CLUSTER="s/^#.*cluster\.name:.*/cluster.name: ${ES_CLUSTER_NAME}/"
	sed -i "${REPLACEMENT_CLUSTER}" /usr/share/elasticsearch/config/elasticsearch.yml


	REPLACEMENT_NAME="s/^#.*node\.name:.*/node.name: ${HOSTNAME}/"
	sed -i "${REPLACEMENT_NAME}" /usr/share/elasticsearch/config/elasticsearch.yml


	#REPLACEMENT_NODE_MASTER="s/^#.*node\.master:.*/node.master: ${ES_NODE_MASTER}/"
	#sed -i "${REPLACEMENT_NODE_MASTER}" /usr/share/elasticsearch/config/elasticsearch.yml
	printf "node.master: ${ES_NODE_MASTER}\n" >> /usr/share/elasticsearch/config/elasticsearch.yml


	#REPLACEMENT_NODE_DATA="s/^#.*node\.data:.*/node.data: ${ES_NODE_DATA}/"
	#sed -i "${REPLACEMENT_NODE_DATA}" /usr/share/elasticsearch/config/elasticsearch.yml
	printf "node.data: ${ES_NODE_DATA}\n" >> /usr/share/elasticsearch/config/elasticsearch.yml


	REPLACEMENT_PATH_DATA='s/^#.*path\.data:.*/path.data: \/elasticsearch\/data/'
	sed -i "${REPLACEMENT_PATH_DATA}" /usr/share/elasticsearch/config/elasticsearch.yml


	REPLACEMENT_PATH_LOGS='s/^#.*path\.logs:.*/path.logs: \/elasticsearch\/log/'
	sed -i "${REPLACEMENT_PATH_LOGS}" /usr/share/elasticsearch/config/elasticsearch.yml


	if [ "$ES_ENVIRONMENT" = "prod" ]; then
		REPLACEMENT_BOOTSTRAP_MLOCKALL='s/^#.*bootstrap\.memory_lock:\s*true/bootstrap.memory_lock: true/'
		sed -i "${REPLACEMENT_BOOTSTRAP_MLOCKALL}" /usr/share/elasticsearch/config/elasticsearch.yml
	fi


	REPLACEMENT_NETWORK_HOST='s/^#.*network\.host:.*/network.host: _eth0:ipv4_/'
	sed -i "${REPLACEMENT_NETWORK_HOST}" /usr/share/elasticsearch/config/elasticsearch.yml


	NUM_MASTERS=$(echo $MASTER| jq -r -e 'unique | length')
	if [ "$ES_NODE_MASTER" = 'true' ]; then
		NEW_QUORUM=$(( ((NUM_MASTERS+1)/2)+1 ))
	else
		NEW_QUORUM=$(( (NUM_MASTERS/2)+1 ))
	fi
	QUORUM=$(curl -E /etc/tls/client_certificate.crt -Ls --fail "${CONSUL_HTTP_ADDR}/v1/health/service/elasticsearch-master"|jq -r -e '[.[].Service.Address] | unique | length // 1')
	if [ "$NEW_QUORUM" -gt "${QUORUM}" ]; then
		QUORUM="$NEW_QUORUM"
	fi
	REPLACEMENT_ZEN_MIN_NODES="s/^#.*discovery\.zen\.minimum_master_nodes:.*/discovery.zen.minimum_master_nodes: ${QUORUM}/"
	sed -i "${REPLACEMENT_ZEN_MIN_NODES}" /usr/share/elasticsearch/config/elasticsearch.yml


	#REPLACEMENT_ZEN_MCAST='s/^#.*discovery\.zen\.ping\.multicast\.enabled:.*/discovery.zen.ping.multicast.enabled: false/'
	#sed -i "${REPLACEMENT_ZEN_MCAST}" /usr/share/elasticsearch/config/elasticsearch.yml


	MASTER=$(echo $MASTER | jq -e -r -c 'unique | [.[]+":9300"]')
	REPLACEMENT_ZEN_UNICAST_HOSTS="s/^#.*discovery\.zen\.ping\.unicast\.hosts.*/discovery.zen.ping.unicast.hosts: ${MASTER}/"
	sed -i "${REPLACEMENT_ZEN_UNICAST_HOSTS}" /usr/share/elasticsearch/config/elasticsearch.yml


#	printf "discovery.zen.ping.retries: 6\n" >> /usr/share/elasticsearch/config/elasticsearch.yml
}

# Get the list of ES master nodes from Consul
get_ES_Master() {
	MASTER=$(curl -E /etc/tls/client_certificate.crt -Ls --fail "${CONSUL_HTTP_ADDR}/v1/health/service/elasticsearch-master"| jq -r -e -c '[.[].Service.Address]')
	if [[ $MASTER != "[]" ]] && [[ -n $MASTER ]]; then
		log "Master found ${MASTER}, joining cluster."
		update_ES_configuration
		exit 0
	else
		unset MASTER
		return 1
	fi
}
#------------------------------------------------------------------------------
# Check that CONSUL_HTTP_ADDR environment variable exists
if [[ -z ${CONSUL_HTTP_ADDR} ]]; then
	loge "Missing CONSUL_HTTP_ADDR environment variable"
	exit 1
fi

# Wait up to 2 minutes for Consul to be available
log "Waiting for Consul availability..."
n=0
until [ $n -ge 120 ]||(curl -E /etc/tls/client_certificate.crt -fsL --connect-timeout 1 "${CONSUL_HTTP_ADDR}/v1/status/leader" &> /dev/null); do
	sleep 5s
	n=$((n+5))
done
if [ $n -ge 120 ]; then
	loge "Consul unavailable, aborting"
	exit 1
fi

log "Consul is now available [${n}s], starting up Elasticsearch"
get_ES_Master

# Data-only or client nodes can only wait until there's a master available
if [ "$ES_NODE_MASTER" = false ]; then
	log "Client or Data only node, waiting for master"
	until get_ES_Master; do
		sleep 10s
	done
else
	# A master+data node will retry for 5 minutes to see if there's
	# another master in the cluster in the process of starting up. But we
	# bail out if we exceed the retries and just bootstrap the cluster
	if [ "$ES_NODE_DATA" = true ]; then
		log "Master+Data node, waiting up to 5m for master"
		n=0
		until [ $n -ge 300 ]; do
			until (curl -E /etc/tls/client_certificate.crt -Ls --fail "${CONSUL_HTTP_ADDR}/v1/health/service/elasticsearch-master?passing" | jq -r -e '.[0].Service.Address' >/dev/null); do
				sleep 5s
				n=$((n+5))
			done
		curl -NLsS --fail -o /dev/null "http://elasticsearch-master.service.consul:9200/_cluster/health?timeout=5s"
		get_ES_Master
		n=$((n+5))
		done
		log "Master not found. Proceed as master"
	fi
	# for a master-only node (or master+data node that has exceeded the
	# retry attempts), we'll assume this is the first master and bootstrap
	# the cluster
	log "MASTER node, bootstrapping..."
	MASTER="[]"
	update_ES_configuration
fi
