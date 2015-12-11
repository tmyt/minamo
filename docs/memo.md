# memo

## api

- /create
- /delete

## sequence

### create service
1. call /create?name=hoge
2. create git repository in http://git.your.domain/hoge.git
3. run docker from http://git.your.domain/hoge.git
4. add map for hoge.your.domain to redis

### proxy to service
1. call hoge.your.domain
2. proxy hoge.your.domain to docker by redis

### push to service
1. on post-receive
2. stop docker hoge.your.domain
3. rebuild&run docker hoge.your.domain
4. update map for hoge.your.domain to redis

### remove service
1. call /delete?name=hoge
2. stop docker
3. remove map for hoge.your.domain
4. remove repository from http://git.your.domain/hoge.git

## Dockerfile

```dockerfile
FROM node
ENV PORT 3000
EXPOSE 3000
ADD dummyfile /tmp/dummy
RUN node --version
RUN git clone https://github.com/tmyt/express-test.git # http://git.your.domain/[service].git
WORKDIR express-test # [service]
RUN npm install
RUN ls -l
RUN pwd
RUN npm start
```
