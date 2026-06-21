#!/bin/sh
mkdir -p /etc/nginx/certs
if [ -f /certs/server.crt ] && [ -f /certs/server.key ]; then
    cp /certs/server.crt /etc/nginx/certs/server.crt
    cp /certs/server.key /etc/nginx/certs/server.key
    echo "Using Let's Encrypt cert"
else
    echo "WARNING: No cert found, nginx may fail"
fi
exec nginx -g "daemon off;"
