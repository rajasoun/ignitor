FROM alpine:3.5
LABEL Vendor="Alpine"
MAINTAINER Raja. S <rajasoun@icloud.com>

ENV TZ="UTC"
ENV S6_OVERLAY_VERSION=v1.18.1.5
# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2

LABEL distro="alpine" distro_version="3.5" architecture="amd64"


RUN set -x \
    # This folder is in $PATH by default but isn't created by default
    && mkdir -p /usr/local/sbin \
    # Install minimal packages
    && apk add --no-cache ca-certificates curl 'su-exec>=0.2' \
    # Install s6 overlay
    && curl -L -s https://github.com/just-containers/s6-overlay/releases/download/v1.18.1.5/s6-overlay-amd64.tar.gz \
      | tar xvzf - -C / \
    && apk del --no-cache curl \  
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/*

# Inject files in container file system
COPY rootfs /

# Init
ENTRYPOINT ["/init"]
CMD []
