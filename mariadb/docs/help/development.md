
# Development

How to use this repositorie for local development.

## Quick Start
``` sh
    git clone https://github.com/daspanel/mariadb
    git remote rm origin
    # hack on source/Dockerfile
    make clean clean-image clean-image-dangling build
```

## Overview

If you want to use some app with this docker project, starting putting the interesting
code under `src/` dir.  The project and corresponding build pipeline
will "just work".

## Building pipeline

You can create a 'docker-compose.override.template' that adapts it
properly to your development environment.  The Makefile when then
generate a 'docker-compose.override.yml' file from the template.

If you want to adapt it to your demo and/or production environemnts,
create a file something like docker-compose.<ENV>.yml and use 'make
build-<ENV> run-<ENV>'

## Testing

You can test in several ways

1. Run a container using this image and getting an interactive shell:
    <!-- language: lang-sh -->

        docker-compose run mariadb /bin/sh

    All content inside the `src` dir will be avaiable on the `/app` dir of the 
container and you can work

2. Execute scripts inside a running container:
    1. Put some script that do tests when the container run unde `src/`
    2. Excute the script:
        <!-- language: lang-sh -->

            docker-compose exec mariadb /app/yourscript

    *This only work when your docker image is not stopped, i.e., when the image 
have a long running processes like a MySql server. See 
[docker-compose docs](https://docs.docker.com/compose/>) and the 
[exec command](https://docs.docker.com/compose/reference/exec/) for more info.*



## Customization

Modify 'docker-compose.yml' to launch your project correctly. 

Add make rules, recipes and dependencies to 'recipes.mk' to add extra
build steps or dependencies.  Modify Makefile as a last resort (and
let me know what you had to modify so I can look into supporting that
customization).

Use environment specific overrides to run in different environments.

