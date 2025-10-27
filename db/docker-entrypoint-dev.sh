#!/bin/bash
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
fi

# Run database migrations or stamp new database
echo "Running database migrations..."
cd /app/db

if [ "$HAS_ALEMBIC" = true ]; then
    # Existing database with migration history - run migrations
    python -m alembic upgrade head
    MIGRATION_RESULT=$?
else
    # New database - stamp it with current version instead of migrating
    echo "New database detected, stamping with current migration version..."
    python -m alembic stamp head
    MIGRATION_RESULT=$?
fi

# Check if migrations were successful
if [ $MIGRATION_RESULT -eq 0 ]; then
    echo "Migrations completed successfully!"
else
    echo "Warning: Migrations failed, attempting to stamp to head..."
    python -m alembic stamp head
    if [ $? -ne 0 ]; then
        echo "Warning: Could not stamp database, but continuing to start the application..."
    fi
fi

# Start the application
if [ "$DEBUG" = "1" ]; then
    echo "Starting FastAPI application in debug mode..."
    python -m debugpy --listen 0.0.0.0:5678 --wait-for-client -m uvicorn db.main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "Starting FastAPI application in normal mode..."
    uvicorn db.main:app --host 0.0.0.0 --port 8000 --reload
fi