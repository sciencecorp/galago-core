#!/bin/bash
export PYTHONPATH="/app"

echo "Running pre-migration backup..."
python /app/db/backup_manager.py

if [ $? -ne 0 ]; then
    echo "WARNING: Backup script encountered issues, but continuing..."
fi

# Run database migrations
echo "Running database migrations..."
cd /app/db && python -m alembic upgrade head

# Check if migrations were successful
if [ $? -eq 0 ]; then
    echo "Migrations completed successfully!"
else
    echo "Warning: Migrations failed, but continuing to start the application..."
fi

# Start the application
if [ "$DEBUG" = "1" ]; then
    echo "Starting FastAPI application in debug mode..."
    python -m debugpy --listen 0.0.0.0:5678 --wait-for-client -m uvicorn db.main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "Starting FastAPI application in normal mode..."
    uvicorn db.main:app --host 0.0.0.0 --port 8000 --reload
fi