from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import INVENTORY_DB_URL, LOGS_DB_URL


Base = declarative_base()
LogBase = declarative_base()


inventory_engine = create_engine(INVENTORY_DB_URL, connect_args={"check_same_thread": False})
logs_engine = create_engine(LOGS_DB_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=inventory_engine)
LogsSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=logs_engine)
