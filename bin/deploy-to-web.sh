#!/usr/bin/env sh

set -e

npm run build:web
scp -r dist/* root@85.255.7.92:meebible/www-app/