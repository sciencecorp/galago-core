import typing as t
from fastapi import HTTPException
from sqlalchemy.orm import Session
from db.models.db_session import SessionLocal, LogsSessionLocal
from db import crud


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


def get_selected_workcell_name(db: Session) -> str:
    """Get the currently selected workcell name from settings.
    
    Raises:
        HTTPException: If no workcell is selected
    """
    workcell_setting = crud.settings.get_by(db, obj_in={"name": "workcell"})
    if not workcell_setting or not workcell_setting.is_active:
        raise HTTPException(
            status_code=400, 
            detail="No workcell is currently selected. Please select a workcell in settings."
        )
    return workcell_setting.value


def get_selected_workcell_id(db: Session) -> int:
    """Get the currently selected workcell ID from settings.
    
    Raises:
        HTTPException: If no workcell is selected or workcell doesn't exist
    """
    # Get the workcell setting
    workcell_setting = crud.settings.get_by(db, obj_in={"name": "workcell"})
    if not workcell_setting or not workcell_setting.is_active:
        raise HTTPException(
            status_code=400, 
            detail="No workcell is currently selected. Please select a workcell in settings."
        )
    
    # Get the workcell by name
    selected_workcell = crud.workcell.get_by(db, obj_in={"name": workcell_setting.value})
    if not selected_workcell:
        raise HTTPException(
            status_code=400,
            detail=f"Selected workcell '{workcell_setting.value}' not found"
        )
    
    return selected_workcell.id