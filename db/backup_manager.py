"""
Database backup manager for automatic backups before migrations.
"""
import os
import shutil
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class BackupManager:
    def __init__(
        self,
        db_path: str = "/app/db/data/galago.db",
        backup_dir: str = "/app/db/data/backups",
        retention_days: int = 7
    ):
        self.db_path = Path(db_path)
        self.backup_dir = Path(backup_dir)
        self.retention_days = retention_days
        
        # Create backup directory if it doesn't exist
        self.backup_dir.mkdir(parents=True, exist_ok=True)
    
    def create_backup(self) -> Optional[Path]:
        """Create a backup of the database."""
        if not self.db_path.exists():
            logger.info("No existing database found, skipping backup")
            return None
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = self.backup_dir / f"galago_{timestamp}.db"
        
        try:
            logger.info(f"Creating database backup: {backup_file}")
            shutil.copy2(self.db_path, backup_file)
            logger.info(f"Backup created successfully: {backup_file}")
            
            # Also backup logs database if it exists
            logs_db_path = self.db_path.parent / "logs.db"
            if logs_db_path.exists():
                logs_backup = self.backup_dir / f"logs_{timestamp}.db"
                shutil.copy2(logs_db_path, logs_backup)
                logger.info(f"Logs backup created: {logs_backup}")
            
            return backup_file
        except Exception as e:
            logger.error(f"Backup failed: {e}", exc_info=True)
            return None
    
    def cleanup_old_backups(self) -> int:
        """Remove backups older than retention_days."""
        if self.retention_days <= 0:
            logger.info("Backup retention disabled (retention_days <= 0)")
            return 0
        
        cutoff_date = datetime.now() - timedelta(days=self.retention_days)
        deleted_count = 0
        
        try:
            for backup_file in self.backup_dir.glob("*.db"):
                file_time = datetime.fromtimestamp(backup_file.stat().st_mtime)
                
                if file_time < cutoff_date:
                    logger.info(f"Removing old backup: {backup_file}")
                    backup_file.unlink()
                    deleted_count += 1
            
            if deleted_count > 0:
                logger.info(f"Cleaned up {deleted_count} old backup(s)")
            
            # Log current backup count
            remaining = len(list(self.backup_dir.glob("inventory_*.db")))
            logger.info(f"Total backups retained: {remaining}")
            
        except Exception as e:
            logger.error(f"Error during backup cleanup: {e}", exc_info=True)
        
        return deleted_count
    
    def restore_backup(self, backup_file: Path) -> bool:
        """Restore database from a backup file."""
        if not backup_file.exists():
            logger.error(f"Backup file not found: {backup_file}")
            return False
        
        try:
            logger.info(f"Restoring database from: {backup_file}")
            shutil.copy2(backup_file, self.db_path)
            logger.info("Database restored successfully")
            return True
        except Exception as e:
            logger.error(f"Restore failed: {e}", exc_info=True)
            return False
    
    def list_backups(self) -> list[Path]:
        """List all available backups."""
        return sorted(
            self.backup_dir.glob("*.db"),
            key=lambda p: p.stat().st_mtime,
            reverse=True
        )


def main():
    """Run backup and cleanup."""
    retention_days = int(os.getenv("BACKUP_RETENTION_DAYS", "7"))
    
    manager = BackupManager(retention_days=retention_days)
    
    # Create backup
    backup_file = manager.create_backup()
    
    if backup_file:
        # Cleanup old backups
        manager.cleanup_old_backups()
        
        logger.info("Backup process completed successfully")
        return 0
    else:
        logger.warning("Backup process completed with warnings")
        return 0  # Don't fail if no database exists yet


if __name__ == "__main__":
    import sys
    sys.exit(main())