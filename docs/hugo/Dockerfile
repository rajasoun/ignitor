FROM rajasoun/nodejs:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2

ENV HUGO_VERSION 0.20.7
ENV HUGO_BINARY hugo_${HUGO_VERSION}_linux-64bit

WORKDIR /app

RUN set -x \
    && apk add --no-cache py-pygments git \
    && git clone https://github.com/rajasoun/tracker.doc /app \
    && rm -rf /var/cache/apk/* \
    && apk del git

# Download and Install hugo
RUN mkdir -p /usr/local/hugo
ADD https://github.com/spf13/hugo/releases/download/v${HUGO_VERSION}/${HUGO_BINARY}.tar.gz /usr/local/hugo/

RUN set -x \
    && tar xzf /usr/local/hugo/${HUGO_BINARY}.tar.gz -C /usr/local/hugo/ \
	&& ln -s /usr/local/hugo/hugo /usr/local/bin/hugo \
	&& rm /usr/local/hugo/${HUGO_BINARY}.tar.gz

RUN set -x \
    && npm install \
	&& npm run index
    && hugo

# Expose the ports for Hugo
EXPOSE 1313

# Inject files in container file system
COPY rootfs /

# Init
ENTRYPOINT ["/init"]
CMD [hugo server]

