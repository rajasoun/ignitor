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
    && apk add --no-cache py-pip build-base python-dev libffi-dev openssl-dev git \
    && pip install --upgrade pip \
	&& pip install flask \
    && git clone https://github.com/dmsimard/python-cachetclient \
    && cd python-cachetclient \
    && pip install -r requirements.txt \
    && python setup.py install \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /app/python-cachetclient \
    # make some useful symlinks that are expected to exist
    && if [[ ! -e /usr/bin/python ]];        then ln -sf /usr/bin/python2.7 /usr/bin/python; fi \
    && if [[ ! -e /usr/bin/python-config ]]; then ln -sf /usr/bin/python2.7-config /usr/bin/python-config; fi \
    && if [[ ! -e /usr/bin/easy_install ]];  then ln -sf /usr/bin/easy_install-2.7 /usr/bin/easy_install; fi   \
	&& apk del build-base py-pip libffi-dev openssl-dev git

WORKDIR /app

# Init
ENTRYPOINT ["/init"]
CMD []

