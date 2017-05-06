FROM rajasoun/nodejs:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2

ENV HUGO_VERSION 0.20.7
ENV HUGO_BINARY hugo_${HUGO_VERSION}_linux-64bit

ADD https://github.com/spf13/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_Linux-64bit.tar.gz /tmp

RUN set -x \
    && tar -xf /tmp/hugo_${HUGO_VERSION}_Linux-64bit.tar.gz -C /tmp \
    && mkdir -p /usr/local/sbin \
    && mv /tmp/hugo /usr/local/sbin/hugo \
    && rm -rf /tmp/hugo_${HUGO_VERSION}_linux_amd64

WORKDIR /app

RUN set -x \
    && apk add --no-cache py-pygments git \
    && git clone https://github.com/rajasoun/tracker.doc /app \
    && git submodule init \
    && git submodule update \
    && npm install \
	&& npm run index \
    && rm -rf /var/cache/apk/* \
    && apk del git

COPY ./run.sh /run.sh

# Expose the ports for Hugo
EXPOSE 1313

# Init
ENTRYPOINT ["/init"]
CMD ["/run.sh"]

