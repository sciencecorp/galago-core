from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import INVENTORY_DB_URL, LOGS_DB_URL
from sqlalchemy import event
import os
import subprocess

Base = declarative_base()
LogBase = declarative_base()

inventory_engine = create_engine(
    INVENTORY_DB_URL, connect_args={"check_same_thread": False}
)
logs_engine = create_engine(LOGS_DB_URL, connect_args={"check_same_thread": False})


def _fk_pragma_on_connect(dbapi_con, con_record) -> None:
    dbapi_con.execute("pragma foreign_keys=ON")


event.listen(inventory_engine, "connect", _fk_pragma_on_connect)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=inventory_engine)
LogsSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=logs_engine)


def init_database() -> None:
    """Initialize database tables and stamp with Alembic if new database."""
    # Create all tables
    Base.metadata.create_all(bind=inventory_engine)
    LogBase.metadata.create_all(bind=logs_engine)
    
    # Check if alembic_version table exists
    try:
        with inventory_engine.connect() as conn:
            conn.execute("SELECT version_num FROM alembic_version LIMIT 1")
        # Table exists, migrations will handle updates
    except Exception:
        # No alembic_version table - this is a fresh database
        # Stamp it with the current migration version
        print("New database detected. Stamping with latest migration version...")
        try:
            # Get the directory where this file is located
            db_dir = os.path.dirname(os.path.abspath(__file__))
            # Go up one level to the db directory where alembic.ini is
            alembic_dir = os.path.dirname(db_dir)
            
            result = subprocess.run(
                ["python", "-m", "alembic", "stamp", "head"],
                cwd=alembic_dir,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print("Database stamped successfully with latest migration.")
            else:
                print(f"Warning: Could not stamp database. Error: {result.stderr}")
        except Exception as e:
            print(f"Warning: Could not stamp database with Alembic: {e}")


# Call init_database when this module is imported
# (This happens when the app starts up)
# Uncomment the line below if you want auto-initialization
# init_database()