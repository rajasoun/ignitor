
image_name = rajasoun/ansible
container_name = OPS

RELEASE := scripts/make-release.sh
VERSION=$(shell . $(RELEASE) ; getVersion)


default: build create
clean: delete-images


.release:
	@echo "release=0.1.0" > .release
	@echo "tag=$(NAME)-0.0.1" >> .release
	@echo INFO: .release created
	@cat .release


release: check-status  build create

check-status:
	@. $(RELEASE) ; ! hasChanges || (echo "ERROR: There are still outstanding changes" >&2 && exit 1) ;

build: .release
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
