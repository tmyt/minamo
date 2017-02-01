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

docker inspect ${NAME} > /dev/null
if [ $? -ne 0 ];then
  # container has not built
  exec $(cd $(dirname $0) && pwd)/build.sh $NAME
fi

# stopping flag
mkdir -p /tmp/minamo/
touch /tmp/minamo/${NAME}.prep

# remove current container & image
echo 'restarting...'
echo Restarting container ${NAME} >> $LOG_FILE
exec_docker restart ${NAME}

# clear flag
rm /tmp/minamo/${NAME}.prep
