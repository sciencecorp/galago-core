from sqlalchemy import Column, Integer, String, DateTime
from tools.db.models.db import LogBase
from tools.app_config import Config
import datetime 
from sqlalchemy.ext.declarative import declared_attr

class TimestampMixin:
    @declared_attr
    def created_at(cls) -> Column:
        return Column(DateTime, default=datetime.datetime.now())
    @declared_attr
    def updated_at(cls) -> Column:
        return Column(DateTime, default=datetime.datetime.now(), onupdate=datetime.datetime.now())

class Log(LogBase, TimestampMixin):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True)
    level = Column(String, nullable=False)
    action = Column(String, nullable=False)
    details = Column(String, nullable=False)

if __name__ == "__main__":
    from sqlalchemy import create_engine
    config = Config()
    config.load_app_config()
    engine = create_engine(config.logs_db, connect_args={"check_same_thread": False})
    LogBase.metadata.create_all(engine)


