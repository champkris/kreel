#!/bin/sh
echo "=== Starting Kreels API ==="
echo "Running database migrations..."
npx prisma migrate deploy || true
echo "Migrations complete. Starting server..."
exec node dist/index.js
