#!/bin/bash

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
docker stop ${NAME}
docker rm ${NAME}
docker rmi $(docker images | grep "minamo/${NAME} " | awk '{print $3;}')

# clear flag
rm /tmp/minamo/${NAME}.term
