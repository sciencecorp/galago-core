from sqlalchemy import Column, ForeignKey, Integer, String, func, DateTime
from .db_session import LogBase
import datetime 
from sqlalchemy import Column, Integer, String, DateTime
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