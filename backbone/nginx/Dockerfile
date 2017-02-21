FROM rajasoun/base:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2

RUN set -x \
    && apk add --no-cache nginx \
    && chown -R nginx:www-data /var/lib/nginx \
    && rm -rf /var/cache/apk/*

# Expose the ports for nginx
EXPOSE 80 443

# Inject files in container file system
COPY rootfs /

# Init
ENTRYPOINT ["/init"]
CMD []

