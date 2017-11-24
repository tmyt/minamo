#!/bin/sh
if [ "x$1" = "xinit" ]; then
  cp -a /etc/skel/. /home/user
  chown user.user /home/user/.?*
fi
chown user.user /home/user
chown -R user.user /tmp/.mm
exec login -p -f user
