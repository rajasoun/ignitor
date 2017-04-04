FROM rajasoun/nodejs:0.1
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2
ENV NODE_ENV production
ENV YARN_VERSION 0.21.3

RUN set -ex \
  && npm install --global yarn@${YARN_VERSION} \
  && npm uninstall npm -g

RUN set -ex \
  && apk add --update --no-cache redis  \
  && yarn global add yarn coffee-script yo generator-hubot \
  && yo hubot --owner="Raja. S <rajasoun@icloud.com>" \
              --name="sparkbot" \
              --description="Cisco Spark Hubot" \
              --defaults \
  && rm -rf /var/cache/apk/*


# Init
ENTRYPOINT ["/init"]
CMD []


