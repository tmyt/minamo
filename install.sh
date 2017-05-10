#!/bin/sh

apt-get install git docker.io nginx lua-nginx-redis make gcc libssh-dev g++
docker network create -d bridge -o 'com.docker.network.bridge.name'='minamo0' shell
./images/shell/build.sh
