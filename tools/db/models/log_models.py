from sqlalchemy import Column, ForeignKey,JSON, Integer, String, func, DateTime
from tools.db.models.db import LogBase
from tools.app_config import Config
import datetime 
from sqlalchemy.ext.declarative import declared_attr

class TimestampMixin:
    @declared_attr
    def created_at(cls):
        return Column(DateTime, default=datetime.datetime.now())
    @declared_attr
    def updated_at(cls):
        return Column(DateTime, default=datetime.datetime.now(), onupdate=datetime.datetime.now())

class Log(LogBase, TimestampMixin):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True)
    level = Column(String, nullable=False)
    action = Column(String, nullable=False)
    details = Column(String, nullable=False)

class SlackError(LogBase):
    __tablename__ = "slack_errors"
    id = Column(Integer, primary_key=True)
    message_id = Column(String,nullable=False)
    message = Column(String, nullable=False)
    channel_id = Column(String, nullable=False)
    status = Column(String,nullable=False)
    created_at = Column(Integer, nullable=False,default=datetime.datetime.utcnow())


if __name__ == "__main__":
    from sqlalchemy import create_engine
    config = Config()
    config.load_app_config()
    engine = create_engine(config.logs_db, connect_args={"check_same_thread": False})
    LogBase.metadata.create_all(engine)


