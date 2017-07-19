#!/bin/sh -ue

UID=www-data
GID=www-data

DEST=/opt/nginx
rsync -avz html $DEST

find $DEST/html | xargs chown $UID 
find $DEST/html | xargs chgrp $GID 

