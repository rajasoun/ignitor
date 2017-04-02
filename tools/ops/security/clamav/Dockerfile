FROM rajasoun/base:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2

RUN set -x \
    && apk add --no-cache  wget clamav clamav-db clamav-libunrar  \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/*

VOLUME ["/var/lib/clamav"]

# Inject files in container file system
COPY rootfs /

EXPOSE 3310

# Init
ENTRYPOINT ["/init"]
CMD []
