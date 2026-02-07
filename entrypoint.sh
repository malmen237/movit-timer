#!/bin/sh
set -e
export PORT="${PORT:-8090}"
exec node web-server.js
