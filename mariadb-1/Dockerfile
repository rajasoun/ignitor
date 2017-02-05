FROM rajasoun/base
LABEL Vendor="Alpine"
MAINTAINER Raja. S <rajasoun@icloud.com>

# environment variables
## ARG DEBIAN_FRONTEND="noninteractive"

ENV MYSQL_DIR="/config"
ENV DATADIR=$MYSQL_DIR/databases

# set version label
ARG BUILD_DATE
ARG VERSION
LABEL build_version="CK Auth DB version:- ${VERSION} Build-date:- ${BUILD_DATE}"

# add local files
COPY rootfs /
# ports and volumes
EXPOSE 3306
VOLUME /config

ENTRYPOINT [ "/init" ]
