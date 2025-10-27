#!/bin/bash
set -e

export PYTHONPATH="/app"

echo "Running pre-migration backup..."
python /app/db/backup_manager.py

if [ $? -ne 0 ]; then
    echo "WARNING: Backup script encountered issues, but continuing..."
fi

echo "Running database migrations..."
cd /app/db && python -m alembic upgrade head

# Check if migrations were successful
if [ $? -eq 0 ]; then
    echo "Migrations completed successfully!"
else
    echo "ERROR: Migrations failed!"
    echo "Check /app/db/data/backups/ for recent backup to restore"
    exit 1
fi

echo "Starting FastAPI application in production mode..."
exec uvicorn db.main:app --host 0.0.0.0 --port 8000