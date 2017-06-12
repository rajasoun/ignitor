### Container Solution For nginx-proxy  with letsencrypt

Running nginx as a proxy with SSL support (via the free services of the Let's Encrypt project) on the Docker platform is possible using a combination of images and a docker-compose file.  
This project makes the process very straightforward as follows:

```bash
    sh -c "proxy/proxy.sh start"
```

Please note that the setup uses an external network that needs to be created first (the second command above), a one-time step required per docker host.  
This allows you to define services in a separate docker-compose file and join those that need proxying to the external network.  Here's how it's done:

```
version: '3'

services:
   myservice:
      <other-details not shown>
      networks:
         - nginx-proxy

networks:
   nginx-proxy:
      external: true
```

Additionally, a subnet is specified in the network definition, which enables processes within your containers that need to be told where to accept request from to indicate the particular subnet in question.  
For example, to tell a tracker server to accept requests from any process within the proxy network you could:

```
  bitcoind:
    image: tracker
    <other-details-omitted>
    command:
      -server
      -rpcuser=$BTCUSER
      -rpcpassword=$BTCPASS
      -rpcallowip=172.28.0.0/16
      -printtoconsole
    networks:
      - nginx-proxy
```

Finally, the `--opt` passed during network creation makes sure to name the real interface as well since Docker otherwise assigns a random `br-<random hex string>` name to it.  
Naming the real interface facilitates fine-tuning the IP tables using the name

#### Debugging

To use the staging servers from Let's Encrypt (instead of production which rate limits), create a `.env` file in the same directory where the docker-compose is located with the contents below, like this:

```bash 
echo "ACME_CA_URI=https://acme-staging.api.letsencrypt.org/directory" >> .env
```
#### Components:

For further information regarding the various components in this solution, please refer to each project:

* [nginx-proxy with SSL support](https://github.com/rajasoun/nginx-proxy-LE-docker-compose)
* [The official NGINX image](https://github.com/nginxinc/docker-nginx)
* [JWilder's docker-gen](https://github.com/jwilder/docker-gen)
* [JrCs' docker-letsencrypt nginx-proxy companion ](https://github.com/JrCs/docker-letsencrypt-nginx-proxy-companion)

#### WARNING

The current docker-compose file is structured to expect the docker-gen template to be provided by JrCs's companion package.  
If [PR #203](https://github.com/JrCs/docker-letsencrypt-nginx-proxy-companion/pull/203) is approved, everyting should work flawlessly.  
If that PR is not approved, you'll likely get an error when `nginx-gen` tries to come up as follows:

> 2017/05/06 03:09:20 Unable to parse template: open /etc/docker-gen/templates/nginx.tmpl: no such file or directory

in which case you'll need to fetch the template yourself and put it in the container.  Grab this file:

```bash
curl -O https://raw.githubusercontent.com/jwilder/nginx-proxy/master/nginx.tmpl
```

then bring up LE and watch the logs until it's done initialising (it will sleep when ready):

```bash
docker-compose up -d nginx-ssl
docker logs -f nginx-ssl
```

then copy the template into the container and restart the generator:

```bash
docker cp nginx.tmpl nginx-gen:/etc/docker-gen/templates/
docker restart nginx-gen
```

To see it in action, start a container that uses the proxy and look at the certs generated:

```bash
docker exec -it nginx-ssl ls -R /etc/nginx/certs --color=none
```

and the config generated:

```bash
docker exec -it nginx-proxy cat /etc/nginx/conf.d/default.conf
```

### To Test Locally

In proxy.sh  change line 
```
    export WHOAMI_HOST=whoami.$(hostname) to 
    export WHOAMI_HOST=whoami.local
```
In Command Window 
```
    curl  -L  -H "Host: whoami.local" localhost
```

### To Test Cloud Host with Proper DNS Entries
```
    curl -svo /dev/null -L  "HOST: whoami.myck.io" http://whoami.myck.io
```
