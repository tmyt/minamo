#!/bin/sh

NAME=$1
PORT=3000

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
echo "FROM node
ENV PORT ${PORT}
EXPOSE ${PORT}
ADD created_at /tmp/created_at
RUN node --version
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
rmdir /tmp/$$
