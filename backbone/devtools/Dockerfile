FROM rajasoun/base:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2

RUN set -x \
    && apk add --no-cache --virtual .deps ruby curl \
    && apk add --no-cache --virtual .build-deps ruby-rake ruby-libs ruby-dev musl-dev gcc make \
    && apk add --no-cache py-pip build-base python-dev libffi-dev  \
    && pip install --upgrade pip \
    && pip install python-swiftclient \
    && apk del .build-deps \
    && rm -rf /var/cache/apk/*   \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \

# Inject files in container file system
COPY rootfs /

# Init
ENTRYPOINT ["/init"]
CMD []
