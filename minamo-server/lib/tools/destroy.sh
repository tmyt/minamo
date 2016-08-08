#!/bin/bash

NAME=$1

if [ "x$NAME" = "x" ]; then
  echo "[ERROR] name not found"
  exit 1
fi

# remove data container & image
echo 'stopping...'
docker rm ${NAME}-data
docker rmi $(docker images | grep "minamo/${NAME}-data " | awk '{print $3;}')
