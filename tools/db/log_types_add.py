from sqlalchemy.orm import Session
import tools.db.crud as crud
import tools.db.schemas as schemas
import logging
from tools.db.models.db import LogsSessionLocal
from tools.db.models.log_models import LogType

def add_log_types(db_session: Session, log_types: list[str]) -> None:
    for i in log_types:
        exists = db_session.query(LogType).filter(LogType.name == str(i)).first()
        if not exists:
            crud.log_type.create(db_session, obj_in = schemas.LogTypeCreate(name=i))


if __name__ == "__main__":
    engine = LogsSessionLocal()
    try:
        add_log_types(LogsSessionLocal(), ["ERROR","WARNING","DEBUG","INFO","PLATE_MOVE","RUN_START","RUN_END", "PLATE_READ"])
    except Exception as e:
        logging.error(e)
    finally:
        engine.close()
