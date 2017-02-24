FROM rajasoun/base:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2


# ensure local python is preferred over distribution python
ENV PATH /usr/local/bin:$PATH

# http://bugs.python.org/issue19846
# > At the moment, setting "LANG=C" on a Linux system *fundamentally breaks Python 3*, and that's not OK.
ENV LANG C.UTF-8

RUN set -ex \
    && apk add --no-cache py-pip build-base python-dev libffi-dev openssl-dev \
    && pip install --upgrade pip \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
	&& pip install flask \
	&& apk del build-base py-pip libffi-dev openssl-dev

WORKDIR /app

# Init
ENTRYPOINT ["/init"]
CMD []

