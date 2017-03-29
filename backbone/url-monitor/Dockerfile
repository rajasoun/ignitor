FROM golang:1.8-alpine
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>



RUN set -ex \
	&& apk add --no-cache  \
		bash \
		git \
		openssh

RUN set -ex \
    && apk add --no-cache bash git openssh \
	&& go get "github.com/Sirupsen/logrus" \
	&& go get "github.com/castawaylabs/cachet-monitor" \
	&& go get "github.com/docopt/docopt-go" \
	&& go get "github.com/mitchellh/mapstructure" \
	&& go get "gopkg.in/yaml.v2"

COPY main.go    /go/src/app
COPY config.yml /go/src/app
