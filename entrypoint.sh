#!/bin/sh
mkdir -p /etc/nginx/certs
if [ -f /certs/server.crt ] && [ -f /certs/server.key ]; then
    cp /certs/server.crt /etc/nginx/certs/server.crt
    cp /certs/server.key /etc/nginx/certs/server.key
    echo "SSL cert loaded"
else
    echo "WARNING: No SSL cert found"
fi
exec nginx -g "daemon off;"
