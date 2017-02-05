FROM rajasoun/base:0.0.0-6f304ed
LABEL Vendor="Raja.S"

MAINTAINER Raja. S <rajasoun@icloud.com>

# Stop container initialization if error occurs in cont-init.d fix-attrs.d script's
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2


RUN apk update
RUN apk --no-cache add --update iojs py-pip build-base python-dev py-boto
RUN pip install awscli ansible

RUN pip install python-keyczar boto hvac
RUN pip install --upgrade pip python-keyczar setuptools
RUN rm -rf /var/cache/apk/*
RUN rm -rf /tmp/*

RUN mkdir /etc/ansible/ /ansible
RUN echo "[localhost]" > /etc/ansible/hosts
RUN echo "localhost ansible_connection=local" >> /etc/ansible/hosts
RUN mkdir -p /opt/ansible/
RUN mkdir -p /ansible/playbooks

WORKDIR /ansible/playbooks

ENV ANSIBLE_GATHERING smart
ENV ANSIBLE_HOST_KEY_CHECKING false
ENV ANSIBLE_RETRY_FILES_ENABLED false
ENV ANSIBLE_ROLES_PATH /ansible/playbooks/roles
ENV ANSIBLE_SSH_PIPELINING True
ENV PATH /ansible/bin:$PATH
ENV PYTHONPATH /ansible/lib

ENTRYPOINT ["ansible-playbook"]

