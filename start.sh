#!/usr/bin/env bash
set -e

# Change to the server directory and start the Node app
# NOTE: dependencies should be installed during the Railway build step
cd server
echo "Starting server (assumes dependencies already installed)..."
node index.js
