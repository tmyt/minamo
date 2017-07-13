#!/bin/sh
if [ "x$1" = "xinit" ]; then
  cp -a /etc/skel/. /home/user
  chown user.user /home/user/.?*
fi
chown user.user /home/user
exec login -f user MM_AUTH_TOKEN=$MM_AUTH_TOKEN
