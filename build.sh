#!/bin/bash

NAME=$1
PORT=$(($RANDOM + 3000))
DOMAIN=onsen.tech

if [ "x$NAME" = "x" ]; then
  echo "[ERROR] name not found"
  exit 1
fi

# remove current container & image
echo 'stopping...'
docker stop ${NAME}
docker rm ${NAME}
docker rmi $(docker images | grep "minamo/${NAME} " | awk '{print $3;}')

# build image
PWD=$(pwd)
mkdir /tmp/$$
cd /tmp/$$
date > created_at
DOCKER0=$(ip addr show docker0 | grep inet | awk '{print $2;}' | cut -f 1 -d '/')
echo "127.0.0.1 localhost
::1 localhost
${DOCKER0} git.${DOMAIN}" > hosts
echo "FROM node
ENV PORT ${PORT}
EXPOSE ${PORT}
ADD created_at /tmp/created_at
ADD hosts /etc/hosts
RUN node --version
# RUN git clone http://git.${DOMAIN}/${NAME}.git
RUN git clone https://github.com/tmyt/${NAME}.git
WORKDIR ${NAME}
RUN npm install
RUN ls -l
RUN pwd
CMD npm start" > Dockerfile
docker build --rm=true -t minamo/${NAME} .

# run container
docker run --name ${NAME} minamo/${NAME} &
echo 'started'
cd ${PWD}

# cleanup tmp dir
rm /tmp/$$/Dockerfile
rm /tmp/$$/created_at
rm /tmp/$$/hosts
rmdir /tmp/$$

# update host mapping
while [ "x$REMOTEADDR" = "x" ]; do
  sleep 1
  REMOTEADDR=$(docker inspect --format '{{.NetworkSettings.IPAddress}}' ${NAME})
done
redis-cli SET "${NAME}.${DOMAIN}" "http://${REMOTEADDR}:${PORT}/"

