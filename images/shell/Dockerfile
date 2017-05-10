FROM debian

# Setup packages
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get -y upgrade && \
    apt-get install -y ssh build-essential vim emacs nano tmux openssl curl python python3 ruby git sudo dnsutils whois && \
    apt-get autoclean
RUN echo '%sudo ALL=NOPASSWD: ALL' >> /etc/sudoers
RUN adduser user && usermod -a -G sudo user

# Add Tini
ENV TINI_VERSION v0.14.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]
CMD ["/bin/bash"]
