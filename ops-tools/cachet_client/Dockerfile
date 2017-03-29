FROM rajasoun/python:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

RUN set -ex \
    && apk add --no-cache py-pip git \
    && git clone https://github.com/dmsimard/python-cachetclient \
    && cd python-cachetclient \
    && pip install -r requirements.txt \
    && python setup.py install \
    && cd /app \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /app/python-cachetclient \
	&& apk del py-pip git

WORKDIR /app

# Init
ENTRYPOINT ["/init"]
CMD []

