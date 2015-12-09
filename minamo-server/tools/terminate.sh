#!/bin/bash

NAME=$1

if [ "x$NAME" = "x" ]; then
  echo "[ERROR] name not found"
  exit 1
fi

# remove current container & image
echo 'stopping...'
docker stop ${NAME}
docker rm ${NAME}
docker rmi $(docker images | grep "minamo/${NAME} " | awk '{print $3;}')

