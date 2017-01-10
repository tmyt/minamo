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

# get docker0 ip addr
DOCKER0=$(ip addr show docker0 | grep inet | grep global | awk '{print $2;}' | cut -f 1 -d '/')

# listup extra packages
EXTRAPKGS=""
if [ "x${MINAMO_BUILD_REQUIRED_REDIS}" != "x" ]; then
  EXTRAPKGS="${EXTRAPKGS} redis-server"
fi
if [ "x${EXTRAPKGS}" != "x" ]; then
  EXTRAPKGS="RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y ${EXTRAPKGS}";
fi

# determine package manager
PM="npm"
PM_INSTALL=""
if [ "x${MINAMO_BUILD_REQUIRED_YARN}" != "x" ]; then
  PM="~/.yarn/bin/yarn"
  PM_INSTALL="curl -o- -L https://yarnpkg.com/install.sh | bash; "
fi

# generate Dockerfile
echo "FROM node:${MINAMO_NODE_VERSION}
ENV PORT=${PORT} MINAMO_BRANCH_NAME=master ${EXTRAENV}
EXPOSE ${PORT}
${EXTRAPKGS}
RUN adduser minamo; mkdir -p /service/${NAME}; chown -R minamo:minamo /service/
ADD run.sh /service/run.sh
RUN chmod 755 /service/run.sh
WORKDIR /service/${NAME}
RUN echo ${DOCKER0} git.${DOMAIN} >> /etc/hosts; su minamo -c \"git clone ${REPO} . --recursive && git checkout \$MINAMO_BRANCH_NAME\"; \
    su minamo -c \"${PM_INSTALL} ${PM} run minamo-preinstall ; ${PM} install ; ${PM} run minamo-postinstall || true\"; \
    ls -l; node --version
CMD [\"/service/run.sh\"]" > Dockerfile

# generate startup script
echo "#!/bin/sh
# $(date)
chown -R minamo:minamo /data" > run.sh
if [ "x$MINAMO_BUILD_REQUIRED_REDIS" != "x" ]; then
  echo "/etc/init.d/redis-server start" >> run.sh
fi
echo "su minamo -c '${PM} start'" >> run.sh

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

## cleanup prep file
rm /tmp/minamo/${NAME}.prep

## clear lock file
rm /tmp/minamo/${NAME}.lock
