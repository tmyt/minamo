#!/bin/bash

## Configuration
LOG_FILE=/tmp/minamo/build.log

## Run docker command
function exec_docker(){
  echo "$ docker $*" >> $LOG_FILE
  if [ "x$BACKGROUND" == "x" ]; then
    docker $* >> $LOG_FILE
  else
    docker $* & >> $LOG_FILE
  fi
}

## Script main
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

if [ -f /tmp/minamo/${NAME}.lock ]; then
  echo "[ERROR] the container work in progress"
  exit 1
fi
touch /tmp/minamo/${NAME}.lock

if [ -f "$(dirname $(readlink -f $0))/../../repos/${NAME}" ]; then
  REPO=$(cat $(dirname $(readlink -f $0))/../../repos/${NAME})
fi

## stopping flag
mkdir -p /tmp/minamo/
docker inspect ${NAME} > /dev/null
if [ $? -eq 0 ];then
  touch /tmp/minamo/${NAME}.term
else
  touch /tmp/minamo/${NAME}.prep
fi

## remove current container & image
echo 'stopping...'
echo Stopping container ${NAME} >> $LOG_FILE
exec_docker stop ${NAME}
exec_docker rm ${NAME}
exec_docker rmi $(docker images | grep "minamo/${NAME} " | awk '{print $3;}')

## clear flag
rm /tmp/minamo/${NAME}.term

## prepareing flag
touch /tmp/minamo/${NAME}.prep

## create data container
if ! docker inspect ${NAME}-data > /dev/null 2> /dev/null ; then
  exec_docker create -v /data --name ${NAME}-data busybox
fi

## prepare building
PWD=$(pwd)
mkdir /tmp/$$
cd /tmp/$$
date > created_at

# generate startup script
echo "#!/bin/sh
chown minamo:minamo /data" > run.sh
if [ "x$MINAMO_BUILD_REQUIRED_REDIS" != "x" ]; then
  echo "/etc/init.d/redis-server start" >> run.sh
fi
echo "su minamo -c 'npm start'" >> run.sh

# get docker0 ip addr
DOCKER0=$(ip addr show docker0 | grep inet | grep global | awk '{print $2;}' | cut -f 1 -d '/')

# generate Dockerfile
echo "FROM node:${MINAMO_NODE_VERSION}
ENV DEBIAN_FRONTEND=noninteractive MINAMO_BRANCH_NAME=master
${EXTRAENV}
RUN apt-get update" > Dockerfile
if [ "x$MINAMO_BUILD_REQUIRED_REDIS" != "x" ]; then
  echo "RUN apt-get install -y redis-server" >> Dockerfile
fi
echo "ENV PORT ${PORT}
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
CMD /service/run.sh" >> Dockerfile

## Start docker build
echo ==================== >> $LOG_FILE
echo Building with >> $LOG_FILE
cat Dockerfile >> $LOG_FILE
echo Pulling image... >> $LOG_FILE
exec_docker pull node:${MINAMO_NODE_VERSION}
exec_docker build --force-rm=true --rm=true -t minamo/${NAME} .
echo Docker build exited with $? >> $LOG_FILE

## run container
echo Starting container ${NAME} >> $LOG_FILE
exec_docker run -d --volumes-from ${NAME}-data --name ${NAME} minamo/${NAME}
echo 'started'
cd ${PWD}

## cleanup tmp dir
rm /tmp/$$/Dockerfile
rm /tmp/$$/run.sh
rm /tmp/$$/created_at
rmdir /tmp/$$

## update host mapping
while [ "x$REMOTEADDR" = "x" ]; do
  sleep 1
  REMOTEADDR=$(docker inspect --format '{{.NetworkSettings.IPAddress}}' ${NAME})
  if [ "$?" -ne "0" ]; then
    break
  fi
done

## cleanup prep file
rm /tmp/minamo/${NAME}.prep

## clear lock file
rm /tmp/minamo/${NAME}.lock
