from sqlalchemy import Column, Integer, String, Boolean, Text
from .db_session import Base
from .utils import TimestampMixin


class ApiKey(Base, TimestampMixin):
    __tablename__ = "api_keys"
    id = Column(Integer, primary_key=True)
    service = Column(String, nullable=False)  # 'slack', 'teams', 'email', etc.
    key_name = Column(String, nullable=False)  # For example 'API Key', 'Token', etc.
    key_value = Column(Text, nullable=False)  # Encrypted value of the API key
    is_active = Column(Boolean, default=True)
    description = Column(String, nullable=True)


class User(Base, TimestampMixin):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)  # Store hashed password
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
