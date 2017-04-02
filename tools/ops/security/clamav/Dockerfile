FROM rajasoun/base:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2

RUN set -x \
    && apk add --no-cache  wget clamav clamav-libunrar  \
    && apk del --no-cache wget \
    && wget -O /var/lib/clamav/main.cvd http://database.clamav.net/main.cvd \
    && wget -O /var/lib/clamav/daily.cvd http://database.clamav.net/daily.cvd \
    && wget -O /var/lib/clamav/bytecode.cvd http://database.clamav.net/bytecode.cvd  \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/*
# Inject files in container file system
COPY rootfs /

EXPOSE 3310

# Init
ENTRYPOINT ["/init"]
CMD []
