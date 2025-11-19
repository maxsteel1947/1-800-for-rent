#!/usr/bin/env bash
set -e

# Change to the server directory and install + start the Node app
cd server
echo "Installing server dependencies..."
npm ci
echo "Starting server..."
npm start
