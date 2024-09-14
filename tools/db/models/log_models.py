from sqlalchemy import Column, ForeignKey, Integer, String, func, DateTime
from tools.db.models.db import LogBase
from tools.app_config import Config
import datetime 

class TimestampMixin:
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Log(LogBase):
    __tablename__ = "trace_logs"
    id = Column(Integer, primary_key=True)
    log_type_id = Column(Integer, ForeignKey("log_type.id"), nullable=False)
    tool = Column(String, nullable=False)
    value = Column(String, nullable=False)
    created_at = Column(Integer, nullable=False,default=datetime.datetime.now)


class LogType(LogBase, TimestampMixin):
    __tablename__ = "log_type"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)

class SlackError(LogBase):
    __tablename__ = "slack_errors"
    id = Column(Integer, primary_key=True)
    message_id = Column(String,nullable=False)
    message = Column(String, nullable=False)
    channel_id = Column(String, nullable=False)
    status = Column(String,nullable=False)
    created_at = Column(Integer, nullable=False,default=datetime.datetime.now)


if __name__ == "__main__":
    from sqlalchemy import create_engine
    config = Config()
    config.load_app_config()
    if config.app_config.data_folder is not None:
        engine = create_engine(f"sqlite:///{config.app_config.data_folder}/db/logs.db")
        LogBase.metadata.create_all(engine)


