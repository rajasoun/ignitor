FROM rajasoun/base:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2

RUN set -x \
    && apk --update --no-cache add iproute2 \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/*

# Init
ENTRYPOINT ["/sbin/ip", "addr", "add", "169.254.255.254/24", "dev", "lo:0"]
CMD []
