#!/bin/sh -ue
NGINX_ROOT=/opt/nginx
rsync -avz html $NGINX_ROOT
