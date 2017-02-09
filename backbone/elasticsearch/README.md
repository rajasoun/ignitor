Autopilot Pattern Elasticsearch
==========

[Elasticsearch](https://www.elastic.co/products) designed for automated operation using the [Autopilot Pattern](http://autopilotpattern.io/).

### Discovery with ContainerPilot
When a data node starts, it will use [ContainerPilot](https://github.com/joyent/containerpilot) to query Consul and find a master node to bootstrap unicast zen discovery. We write this to the node configuration file on each start, so if the bootstrap node dies we can still safely reboot data nodes and join them to whatever master is available.

Launch a cluster with a single master-only node, a single data-only node, a single client node and a master/data node.

```bash
~/elasticsearch-autopilot$ cd composition
~/elasticsearch-autopilot/composition$ docker-compose -p elk up -d
Pulling elasticsearch_master (mterron/elasticsearch-autopilot:latest)...
latest: Pulling from mterron/elasticsearch-autopilot
...
Status: Downloaded newer image for mterron/elasticsearch-autopilot:latest
Creating network "elk_default" with the default driver
Creating elk_consul_1
Creating elk_elasticsearch-master_1
Creating elk_fabio_1
Creating elk_elasticsearch_1
Creating elk_logstash_1
Creating elk_elasticsearch-data_1
Creating elk_kibana_1
```

##### Scale up the Consul cluster to 3 nodes to have quorum.
```bash
~/elasticsearch-autopilot/composition$ docker-compose -p elk scale consul=3
Creating and starting elk_consul_2 ... done
Creating and starting elk_consul_3 ... done

~/elasticsearch-autopilot/composition$ docker ps --format 'table {{ .ID }}\t{{ .Image }}\t{{ .Names }}'
CONTAINER ID        IMAGE                             NAMES
38414635a52b        mterron/consul-betterscratch      elk_consul_2
03cdc87dd763        mterron/consul-betterscratch      elk_consul_3
7eda6c3e3553        mterron/kibana-autopilot          elk_kibana_1
908c07f2ad55        mterron/elasticsearch-autopilot   elk_elasticsearch-data_1
cc5bd4b1f692        mterron/logstash-autopilot        elk_logstash_1
3d25521a9a24        mterron/elasticsearch-autopilot   elk_elasticsearch_1
495c815d9934        mterron/fabiolb                   elk_fabio_1
c3b9c55e0e39        mterron/elasticsearch-autopilot   elk_elasticsearch-master_1
c561a6dc0880        mterron/consul-betterscratch      elk_consul_1
```

##### Check Consul cluster status
```bash
$ docker-compose exec consul consul members
Node          Address           Status  Type    Build  Protocol  DC
03cdc87dd763  172.21.0.9:8301   alive   server  0.6.4  2         demodc
38414635a52b  172.21.0.10:8301  alive   server  0.6.4  2         demodc
3d25521a9a24  172.21.0.5:8301   alive   client  0.6.4  2         demodc
495c815d9934  172.21.0.4:8301   alive   client  0.6.4  2         demodc
7eda6c3e3553  172.21.0.8:8301   alive   client  0.6.4  2         demodc
908c07f2ad55  172.21.0.7:8301   alive   client  0.6.4  2         demodc
c3b9c55e0e39  172.21.0.3:8301   alive   client  0.6.4  2         demodc
c561a6dc0880  172.21.0.2:8301   alive   server  0.6.4  2         demodc
cc5bd4b1f692  172.21.0.6:8301   alive   client  0.6.4  2         demodc
```

##### Let's check the cluster health.
```bash
~/elasticsearch-autopilot/composition$ docker-compose exec elasticsearch sh -c 'curl "http://$(hostname -i):9200/_cluster/health?pretty=true"'
{
  "cluster_name" : "ESDEMO",
  "status" : "green",
  "timed_out" : false,
  "number_of_nodes" : 3,
  "number_of_data_nodes" : 3,
  "active_primary_shards" : 3,
  "active_shards" : 6,
  "relocating_shards" : 0,
  "initializing_shards" : 0,
  "unassigned_shards" : 0,
  "delayed_unassigned_shards" : 0,
  "number_of_pending_tasks" : 0,
  "number_of_in_flight_fetch" : 0,
  "task_max_waiting_in_queue_millis" : 0,
  "active_shards_percent_as_number" : 100.0
}
```

##### Let's get some more details on the cluster:
The composition logs are redirected to Logstash and stored in Elasticsearch. 
You can access Kibana navigating http://HOST_IP:9999
![Kibana](http://s33.postimg.org/79avoe9n3/Captura_de_pantalla_2016_06_09_a_las_1_32_19_p.png)

Also the Consul UI is available using https and a client certificate (an example cert is on the repository) by browsing to https://HOST_IP on a random mapped port. Look for port 8501 mapping in docker ps.
```bash
~/elasticsearch-autopilot/composition$ docker-compose -pelk ps
Name          Command           State   Ports
-------------------------------------------------------------------------------------------
elk_consul_1  /bin/startup.sh   Up      53/tcp, 53/udp, 8300/tcp, 8301/tcp,
                                        8301/udp, 8302/tcp, 8302/udp,
                                        8400/tcp, 8500/tcp,
  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  0.0.0.0:32783->8501/tcp, 
                                        8600/tcp, 8600/udp
```
So in this example, we'll browse to https://HOST_IP:32783
![Consul](http://s33.postimg.org/kwzbfkx8v/Captura_de_pantalla_2016_06_09_a_las_1_30_54_p.png)
