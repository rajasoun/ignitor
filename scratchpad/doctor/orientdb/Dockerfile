FROM rajasoun/java:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2

ARG ORIENTDB_DOWNLOAD_SERVER

ENV ORIENTDB_VERSION 2.2.20
ENV ORIENTDB_DOWNLOAD_MD5 f3d098e8d978437e9679ec4f9d95aa19
ENV ORIENTDB_DOWNLOAD_SHA1 040429b67b33752c0a9852ee0a2e29890733a3c1

ENV ORIENTDB_DOWNLOAD_URL ${ORIENTDB_DOWNLOAD_SERVER:-http://central.maven.org/maven2/com/orientechnologies}/orientdb-community/$ORIENTDB_VERSION/orientdb-community-$ORIENTDB_VERSION.tar.gz

RUN set -x \
    && apk add --update tar curl \
    && rm -rf /var/cache/apk/*

#download distribution tar, untar and delete databases
RUN set -x \
    && mkdir /orientdb  \
    && wget  $ORIENTDB_DOWNLOAD_URL \
    && echo "$ORIENTDB_DOWNLOAD_MD5 *orientdb-community-$ORIENTDB_VERSION.tar.gz" | md5sum -c - \
    && echo "$ORIENTDB_DOWNLOAD_SHA1 *orientdb-community-$ORIENTDB_VERSION.tar.gz" | sha1sum -c - \
    && tar -xvzf orientdb-community-$ORIENTDB_VERSION.tar.gz -C /orientdb --strip-components=1 \
    && rm orientdb-community-$ORIENTDB_VERSION.tar.gz \
    && rm -rf /orientdb/databases/*


ENV PATH /orientdb/bin:$PATH

VOLUME ["/orientdb/backup", "/orientdb/databases", "/orientdb/config"]

WORKDIR /orientdb

#OrientDb binary
EXPOSE 2424

#OrientDb http
EXPOSE 2480

# Init
ENTRYPOINT ["/init"]
CMD ["server.sh"]
