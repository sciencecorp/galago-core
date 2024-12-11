from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import INVENTORY_DB_URL, LOGS_DB_URL
from sqlalchemy import event

Base = declarative_base()
LogBase = declarative_base()


inventory_engine = create_engine(INVENTORY_DB_URL, 
                                 connect_args={"check_same_thread": False})
logs_engine = create_engine(LOGS_DB_URL, 
                            connect_args={"check_same_thread": False})

def _fk_pragma_on_connect(dbapi_con, con_record) -> None:
    dbapi_con.execute('pragma foreign_keys=ON')

event.listen(inventory_engine, 'connect', _fk_pragma_on_connect)

SessionLocal = sessionmaker(autocommit=False, 
                            autoflush=False, bind=inventory_engine)
LogsSessionLocal = sessionmaker(autocommit=False, 
                                autoflush=False, bind=logs_engine)
