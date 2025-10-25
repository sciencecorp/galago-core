from fastapi import APIRouter, HTTPException
from pathlib import Path
import sys
sys.path.append('/app/db')
from backup_manager import BackupManager

router = APIRouter()


@router.post("/backup/create")
def create_backup():
    """Create a manual database backup."""
    manager = BackupManager()
    backup_file = manager.create_backup()
    
    if backup_file:
        return {
            "status": "success",
            "backup_file": str(backup_file),
            "message": "Backup created successfully"
        }
    else:
        raise HTTPException(status_code=500, detail="Backup failed")


@router.get("/backup/list")
def list_backups():
    """List all available backups."""
    manager = BackupManager()
    backups = manager.list_backups()
    
    return {
        "count": len(backups),
        "backups": [
            {
                "filename": b.name,
                "path": str(b),
                "size_mb": round(b.stat().st_size / (1024 * 1024), 2),
                "created": b.stat().st_mtime
            }
            for b in backups
        ]
    }


@router.post("/backup/restore/{filename}")
def restore_backup(filename: str):
    """Restore database from a backup."""
    manager = BackupManager()
    backup_file = manager.backup_dir / filename
    
    if manager.restore_backup(backup_file):
        return {
            "status": "success",
            "message": f"Database restored from {filename}"
        }
    else:
        raise HTTPException(status_code=500, detail="Restore failed")