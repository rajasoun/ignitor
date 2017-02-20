
image_name = rajasoun/base
container_name = ckos

VERSION=0.1


default: build create
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
	docker ps -a -q | xargs docker stop

delete: stop
		docker ps --filter status=dead --filter status=exited -aq | xargs docker rm -v
		docker ps -a -q | xargs  docker rm -v

delete-images: delete
		docker images  --no-trunc | grep '<none>' | awk '{ print $$3 }' | xargs  docker rmi -f
		docker images  --no-trunc | grep '$(image_name)'  | awk '{ print $$3 }' | xargs  docker rmi -f

reset: delete-images
		docker images -q | xargs docker rmi -f
