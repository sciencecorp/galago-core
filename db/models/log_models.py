from sqlalchemy import Column, Integer, String
from .db_session import LogBase
from .utils import TimestampMixin


class Log(LogBase, TimestampMixin):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True)
    level = Column(String, nullable=False)
    action = Column(String, nullable=False)
    details = Column(String, nullable=False)
