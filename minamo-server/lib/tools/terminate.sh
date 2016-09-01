#!/bin/bash

## Configuration
LOG_FILE=/tmp/minamo/build.log

## Run docker command
function exec_docker(){
  echo "$ docker $*" >> $LOG_FILE
  docker $* >> $LOG_FILE
}

NAME=$1

if [ "x$NAME" = "x" ]; then
  echo "[ERROR] name not found"
  exit 1
fi

# stopping flag
mkdir -p /tmp/minamo/
touch /tmp/minamo/${NAME}.term

# remove current container & image
echo 'stopping...'
echo Stopping container ${NAME} >> $LOG_FILE
exec_docker stop ${NAME}
exec_docker rm ${NAME}
exec_docker rmi $(docker images | grep "minamo/${NAME} " | awk '{print $3;}')

# clear flag
rm /tmp/minamo/${NAME}.term
