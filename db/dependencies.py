from sqlalchemy.orm import Session
from db.models.db_session import SessionLocal, LogsSessionLocal
import typing as t


def get_db() -> t.Generator[Session, None, None]:
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()


def log_db() -> t.Generator[Session, None, None]:
    db_session = LogsSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()
