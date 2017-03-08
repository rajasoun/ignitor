
image_name = rajasoun/hostlocal
container_name = hostlocal.io

VERSION=0.1


default: build
clean: delete-images

build:
	docker build --rm -t $(image_name):$(VERSION) .

create:
	docker create --name=$(container_name) \
								-v $(container_name):/config $(image_name):$(VERSION)

run:
	docker start $(container_name)

inspect:
	docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(container_name)

shell:
	docker exec -it $(container_name) /bin/sh

log:
	docker logs -f $(container_name)

stop:
	docker stop  $(container_name)

delete: stop
	docker rm -v  $(container_name)

delete-images: delete
	docker rmi -f $(image_name):$(VERSION)

reset: delete-images
	docker stop $(docker ps -a -q)
    docker rm $(docker ps -a -q)
    docker rmi $(docker images -a -q)
