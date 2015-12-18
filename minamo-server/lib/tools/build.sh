#!/bin/bash

NAME=$1
PORT=$(($RANDOM + 3000))
if [ "x$DOMAIN" = "x" ]; then
  echo "[ERROR] domain not found"
  exit 1
fi

if [ "x$NAME" = "x" ]; then
  echo "[ERROR] name not found"
  exit 1
fi

# stopping flag
mkdir -p /tmp/minamo/
docker inspect ${NAME} > /dev/null
if [ $? -eq 0 ];then
  touch /tmp/minamo/${NAME}.term
else
  touch /tmp/minamo/${NAME}.prep
fi

# remove current container & image
echo 'stopping...'
docker stop ${NAME}
docker rm ${NAME}
docker rmi $(docker images | grep "minamo/${NAME} " | awk '{print $3;}')

# clear flag
rm /tmp/minamo/${NAME}.term

# prepareing flag
touch /tmp/minamo/${NAME}.prep

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
RUN adduser minamo
RUN mkdir -p /service/
RUN chown minamo:minamo /service/
USER minamo
WORKDIR /service/
RUN git clone http://git.${DOMAIN}/${NAME}.git
# RUN git clone https://github.com/tmyt/${NAME}.git
WORKDIR ${NAME}
RUN npm run minamo-preinstall || true
RUN npm install
RUN npm run minamo-postinstall || true
RUN ls -l
RUN pwd
CMD npm start" > Dockerfile
docker build --force-rm=true --rm=true -t minamo/${NAME} .

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
  if [ "$?" -ne "0" ]; then
    break
  fi
done
redis-cli SET "${NAME}.${DOMAIN}" "http://${REMOTEADDR}:${PORT}"

# cleanup prep file
rm /tmp/minamo/${NAME}.prep
