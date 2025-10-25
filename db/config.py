from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

# Create the data directory if it doesn't exist
if not DATA_DIR.exists():
    DATA_DIR.mkdir(parents=True)

inventory_db_path = DATA_DIR / "galago.db"
logs_db_path = DATA_DIR / "logs.db"

INVENTORY_DB_URL = f"sqlite:///{inventory_db_path}"
LOGS_DB_URL = f"sqlite:///{logs_db_path}"
