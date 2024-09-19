from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from tools.app_config import Config

Base = declarative_base()
LogBase = declarative_base()

config = Config()
config.load_app_config()

inventory_engine = create_engine(config.inventory_db, connect_args={"check_same_thread": False})
logs_engine = create_engine(config.logs_db, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=inventory_engine)
LogsSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=logs_engine)
