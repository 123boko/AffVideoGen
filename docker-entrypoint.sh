#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy || npx prisma db push --accept-data-loss

echo "Starting application..."
exec node server.js
