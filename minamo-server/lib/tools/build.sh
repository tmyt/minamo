#!/bin/bash

NAME=$1
PORT=$(($RANDOM + 3000))
REPO=http://git.${DOMAIN}/${NAME}.git
if [ "x$DOMAIN" = "x" ]; then
  echo "[ERROR] domain not found"
  exit 1
fi

if [ "x$NAME" = "x" ]; then
  echo "[ERROR] name not found"
  exit 1
fi

if [ -f "$(dirname $(readlink -f $0))/../../repos/${NAME}" ]; then
  REPO=$(cat $(dirname $(readlink -f $0))/../../repos/${NAME})
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

# create data container
if ! docker inspect ${NAME}-data > /dev/null 2> /dev/null ; then
  docker create -v /data --name ${NAME}-data busybox >> /tmp/minamo/build.log
fi

# build image
PWD=$(pwd)
mkdir /tmp/$$
cd /tmp/$$
date > created_at
echo "#!/bin/sh
chown minamo:minamo /data
/etc/init.d/redis-server start
su minamo -c 'npm start'" > run.sh
DOCKER0=$(ip addr show docker0 | grep inet | grep global | awk '{print $2;}' | cut -f 1 -d '/')
echo "FROM node:latest
ENV DEBIAN_FRONTEND=noninteractive MINAMO_BRANCH_NAME=master
${EXTRAENV}
RUN apt-get update
RUN apt-get install -y redis-server
RUN /etc/init.d/redis-server start
ENV PORT ${PORT}
EXPOSE ${PORT}
ADD created_at /tmp/created_at
RUN node --version
RUN adduser minamo
RUN mkdir -p /service/; chown minamo:minamo /service/
ADD run.sh /service/run.sh
RUN chmod 755 /service/run.sh
WORKDIR /service/
RUN echo ${DOCKER0} git.${DOMAIN} >> /etc/hosts; su minamo -c \"git clone ${REPO} ${NAME} --recursive && cd ${NAME} && git checkout \$MINAMO_BRANCH_NAME\"
USER minamo
WORKDIR ${NAME}
RUN npm run minamo-preinstall || true
RUN npm install
RUN npm run minamo-postinstall || true
RUN ls -l
RUN pwd
USER root
CMD /service/run.sh" > Dockerfile
echo ==================== >> /tmp/minamo/build.log
echo Building with >> /tmp/minamo/build.log
cat Dockerfile >> /tmp/minamo/build.log
echo Pulling image... >> /tmp/minamo/build.log
docker pull node:latest >> /tmp/minamo/build.log
docker build --force-rm=true --rm=true -t minamo/${NAME} . >> /tmp/minamo/build.log
echo Docker build exited with $? >> /tmp/minamo/build.log

# run container
docker run --volumes-from ${NAME}-data --name ${NAME} minamo/${NAME} &
echo 'started'
cd ${PWD}

# cleanup tmp dir
rm /tmp/$$/Dockerfile
rm /tmp/$$/created_at
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
