FROM debian

# Setup packages
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get -y upgrade && \
    apt-get install -y locales locales-all ssh build-essential vim emacs nano tmux openssl curl python python3 ruby git sudo dnsutils whois wget && \
    apt-get autoclean
RUN echo '%sudo ALL=NOPASSWD: ALL' >> /etc/sudoers
RUN adduser user && usermod -a -G sudo user

# Install mm
COPY minamo-cli-1.0.0.tgz /tmp
COPY mm.sh /usr/bin/mm
RUN export NODE_VERSION=v10.16.0 && \
    wget https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz -O /tmp/node-${NODE_VERSION}-linux-x64.tar.xz && \
    tar xf /tmp/node-${NODE_VERSION}-linux-x64.tar.xz -C /tmp && \
    mkdir /opt/node && \
    cp -a /tmp/node-${NODE_VERSION}-linux-x64/bin /opt/node/ && \
    cp -a /tmp/node-${NODE_VERSION}-linux-x64/lib /opt/node/ && \
    rm /tmp/node-${NODE_VERSION}-linux-x64.tar.xz && \
    rm -rf /tmp/node-${NODE_VERSION}-linux-x64 && \
    PATH=${PATH}:/opt/node/bin /opt/node/bin/npm i -g /tmp/minamo-cli-1.0.0.tgz && \
    rm /tmp/minamo-cli-1.0.0.tgz && \
    chmod +x /usr/bin/mm && \
    unset NODE_VERSION

# Add Tini
ADD https://github.com/krallin/tini/releases/download/v0.14.0/tini /tini
ADD init.sh /init.sh
RUN chmod +x /tini /init.sh
ENTRYPOINT ["/tini", "--"]
CMD ["/init.sh"]
