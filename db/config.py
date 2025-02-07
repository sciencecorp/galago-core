from pathlib import Path

IVENTORY_DB = "inventory.db"
LOGS_DB = "logs.db"
BASE_DIR = Path(__file__).resolve().parent


INVENTORY_DB_URL = f"sqlite:///{IVENTORY_DB}"
LOGS_DB_URL = f"sqlite:///{LOGS_DB}"
