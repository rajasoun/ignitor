
# Usage


### Get
```shell
$ docker pull daspanel/mariadb:latest
```

### Run
```shell
$ docker run -e DASPANEL_MASTER_EMAIL=my@email.com --name=my-mariadb daspanel/mariadb:latest
```

### Stop
```shell
$ docker stop my-mariadb
```

### Update image
```shell
$ docker stop my-mariadb
$ docker pull daspanel/mariadb:latest
$ docker run -e DASPANEL_MASTER_EMAIL=my@email.com --name=my-mariadb daspanel/mariadb:latest
```

# Tips
