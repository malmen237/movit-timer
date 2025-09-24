#!/bin/sh

# Set the PORT environment variable for the Node.js app
export PORT="${PORT:-8090}"

# Start the Node.js application
exec node web-server.js
