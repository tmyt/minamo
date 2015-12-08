# Minamo

## やりたいこと
- WEbGUIからサービスの追加削除できる
- AzureMobileServicesのカスタムAPIみたいなん作れる
- Gitでデプロイできる
- index.js をnodejs で実行してくれる
- 自宅クラウドとか、さくらVPSとかにセットアップして使いたい

## 使うもの

- Nginx
- Docker
- NodeJS
- Git
- Redis

## ライブラリとか

- https://github.com/stackdot/NodeJS-Git-Server
- https://github.com/apocas/dockerode
- https://github.com/redis/hiredis
- express.js

## エンドポイント

- ://domain/repos/[ServiceName].git
- ://domain/manage/
- ://[ServiceName].domain/

## 構成

### Frontend

- Nginx + NodeJS + Redis
- Nginxでリクエストを受けてNodeJSで処理。
- サブドメインで分けたサービスに対してNginxでリバースプロキシ
- リバースプロキシの設定はRedisにおけるらしい
- プロキシした先のアプリケーションサーバはDocker内で実行されているNodeJS
- WebGUIからアプリケーションサーバの作成、削除、起動、停止

### Backend
- Docker上のNodeJSでホスト
- 各アプリケーションサーバごとに独立したGitリポジトリを持つ
- GitリポジトリへPushされたらpost-receive-hook でDockerコンテナへデプロイ
- Nginxがプロキシ先として使うポートは環境変数で提供する

## めも

- Nginxのリバースプロキシの設定はRedisから動的に参照できるらしい

## setup

- install redis-server, docker.io, nginx, lua-nginx-redis
- add include to your nginx.conf
- start nginx, docker, redis

