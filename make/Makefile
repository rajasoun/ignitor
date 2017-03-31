default: build
clean: delete-image

build:
	docker build --rm -t $(image_name):$(VERSION) .

create:
	docker create --name=$(container_name) \
			-v $(container_name):/config $(image_name):$(VERSION)

run: create
	docker start $(container_name)

inspect:
	docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(container_name)

shell:
	docker exec -it $(container_name) /bin/sh

logs:
	docker logs -f $(container_name)

stop:
	docker stop  $(container_name)

delete: stop
	docker rm -v  $(container_name)

delete-image:  delete
	docker rmi -f $(image_name):$(VERSION)

destroy:
	docker rmi -f $(image_name):$(VERSION)

reset: delete-image
	docker stop $(docker ps -a -q)
	docker rm $(docker ps -a -q)
	docker rmi $(docker images -a -q)
