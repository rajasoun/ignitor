
image_name = rajasoun/mariadb
container_name = ckdb


default: build create
clean: delete-images

build:
	docker build -t $(image_name) .

create:
	docker create --name=$(container_name) \
								-p 3306:3306 \
								-e MYSQL_ROOT_PASSWORD="Cisco@1234" \
								-e TZ=Etc/UTC  \
								-v $(container_name):/config $(image_name)

run:
	docker start $(container_name)

stop:
	docker ps -a -q | xargs docker stop

delete: stop
		docker ps --filter status=dead --filter status=exited -aq | xargs docker rm -v
		docker ps -a -q | xargs  docker rm -v

delete-images: delete
		docker images --no-trunc | grep '<none>' | awk '{ print $$3 }' | xargs  docker rmi
		docker images --no-trunc | grep '$(image_name)' | awk '{ print $$3 }' | xargs  docker rmi -f

reset: delete-images
		docker images -q | xargs docker rmi -f
