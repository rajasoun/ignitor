#!/usr/bin/env sh


apk add --no-cache bash git openssh
go get "github.com/Sirupsen/logrus"
go get "github.com/castawaylabs/cachet-monitor"
go get "github.com/docopt/docopt-go"
go get "github.com/mitchellh/mapstructure"
go get "gopkg.in/yaml.v2"

go run main.go -c config.yml
