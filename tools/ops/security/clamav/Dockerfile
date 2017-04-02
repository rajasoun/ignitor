FROM rajasoun/base:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2


RUN set -x \
    && apk add --no-cache clamav clamav-libunrar freshclam wget \
    && mkdir /run/clamav \
    && chown clamav:clamav /run/clamav \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/*

RUN set -x \
    && sed -i 's/^#Foreground .*$/Foreground true/g' /etc/clamav/clamd.conf \
    && sed -i 's/^#TCPSocket .*$/TCPSocket 3310/g' /etc/clamav/clamd.conf \
    && sed -i 's/^#Foreground .*$/Foreground true/g' /etc/clamav/freshclam.conf


EXPOSE 3310

RUN freshclam --quiet

# Inject files in container file system
COPY rootfs /

# Init
ENTRYPOINT ["/init"]
CMD []
