### Test The Proxy Conf

curl -H "Host: whoami.local" localhost
curl $(hostname --all-ip-addresses | awk '{print $1}'):8000

docker run -d --rm --name web --net nginx-proxy  -e 'VIRTUAL_HOST=web.myck.io' -e 'LETSENCRYPT_HOST=web.myck.io' -e 'LETSENCRYPT_EMAIL=rajasoun@cisco.com'   nginx:alpine

https://github.com/rajasoun/nginx-proxy-LE-docker-compose

### Points To Note:
1. The containers being proxied must expose the port to be proxied, either by using the EXPOSE directive in their Dockerfile or Ports in docker-compose
2. 
