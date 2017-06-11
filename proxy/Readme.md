### Test The Proxy Conf
docker run -d --rm --name web --net nginx-proxy  -e 'VIRTUAL_HOST=web.myck.io' -e 'LETSENCRYPT_HOST=web.myck.io' -e 'LETSENCRYPT_EMAIL=rajasoun@cisco.com'   nginx:alpine

https://github.com/rajasoun/nginx-proxy-LE-docker-compose
