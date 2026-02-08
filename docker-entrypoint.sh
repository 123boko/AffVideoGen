#!/bin/sh
set -e

echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations..."
node node_modules/prisma/build/index.js db push --accept-data-loss || echo "Migration warning, continuing..."

echo "Starting application..."
exec node server.js
