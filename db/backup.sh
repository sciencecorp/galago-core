#!/bin/bash

# Set paths
DB_PATH="/path/to/your/db.sqlite"
BACKUP_DIR="/path/to/backup/dir"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Create backup
cp "$DB_PATH" "$BACKUP_DIR/db_backup_$TIMESTAMP.sqlite"

# Keep only the last 3 backups
cd "$BACKUP_DIR"
ls -t | grep 'db_backup_' | sed -e '1,3d' | xargs -d '\n' rm -f
