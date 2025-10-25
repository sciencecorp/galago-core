# db/run_migrations.py
from alembic.config import Config
from alembic import command
import os

# Get the directory where this script is located
current_dir = os.path.dirname(os.path.abspath(__file__))
alembic_ini_path = os.path.join(current_dir, "alembic.ini")

# Create Alembic configuration object
alembic_cfg = Config(alembic_ini_path)

# Run the upgrade command
print("Running database migrations...")
command.upgrade(alembic_cfg, "head")
print("Migrations completed successfully!")