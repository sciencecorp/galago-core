#!/bin/bash
set -e
export PYTHONPATH="/app"

# Check if database exists and has alembic_version table
DB_PATH="/app/db/data/galago.db"
HAS_ALEMBIC=false

if [ -f "$DB_PATH" ]; then
    # Check if alembic_version table exists
    ALEMBIC_CHECK=$(sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='table' AND name='alembic_version';" 2>/dev/null)
    if [ ! -z "$ALEMBIC_CHECK" ]; then
        HAS_ALEMBIC=true
    fi
fi

# Only run backup if database exists and has migration history
if [ "$HAS_ALEMBIC" = true ]; then
    echo "Running pre-migration backup..."
    python /app/db/backup_manager.py
    if [ $? -ne 0 ]; then
        echo "WARNING: Backup script encountered issues, but continuing..."
    fi
else
    echo "New database detected - skipping backup..."
fi

echo "Running database migrations..."
cd /app/db

# Run migrations (works for both new and existing databases)
python -m alembic upgrade head

# Check if migrations were successful
if [ $? -eq 0 ]; then
    echo "Migrations completed successfully!"
else
    echo "ERROR: Migrations failed!"
    if [ "$HAS_ALEMBIC" = true ]; then
        echo "Check /app/db/data/backups/ for recent backup to restore"
    fi
    exit 1
fi

echo "Starting FastAPI application in production mode..."
exec uvicorn db.main:app --host 0.0.0.0 --port 8000