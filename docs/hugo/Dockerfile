FROM rajasoun/base:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2

ENV HUGO_VERSION 0.20.7
ENV HUGO_BINARY hugo_${HUGO_VERSION}_linux-64bit

RUN set -x \
    && apk add --no-cache py-pygments git \
    && rm -rf /var/cache/apk/*

# Download and Install hugo
RUN mkdir -p /usr/local/hugo
ADD https://github.com/spf13/hugo/releases/download/v${HUGO_VERSION}/${HUGO_BINARY}.tar.gz /usr/local/hugo/

RUN set -x \
    && tar xzf /usr/local/hugo/${HUGO_BINARY}.tar.gz -C /usr/local/hugo/ \
	&& ln -s /usr/local/hugo/hugo /usr/local/bin/hugo \
	&& rm /usr/local/hugo/${HUGO_BINARY}.tar.gz

# Expose the ports for Hugo
EXPOSE 1313

WORKDIR /app
RUN set -x \
    && git clone https://github.com/rajasoun/tracker.doc \
    && apk del git

# Inject files in container file system
COPY rootfs /

# Init
ENTRYPOINT ["/init"]
CMD []

