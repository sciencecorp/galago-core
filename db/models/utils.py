from sqlalchemy import func
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy import Column, DateTime

class TimestampMixin:
    @declared_attr
    def created_at(cls) -> Column:
        return Column(DateTime, default=func.now())

    @declared_attr
    def updated_at(cls) -> Column:
        return Column(DateTime, default=func.now(), onupdate=func.now())    