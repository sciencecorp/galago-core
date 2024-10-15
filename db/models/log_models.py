from sqlalchemy import Column, ForeignKey, Integer, String, func, DateTime
from .db_session import LogBase
import datetime 
from config import LOGS_DB_URL

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
    engine = create_engine(LOGS_DB_URL, connect_args={"check_same_thread": False})
    LogBase.metadata.create_all(engine)


