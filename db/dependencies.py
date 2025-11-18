import typing as t
from fastapi import HTTPException
from sqlalchemy.orm import Session
from db.models.db_session import SessionLocal, LogsSessionLocal
from db import crud
from typing import Optional

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


def get_selected_workcell_name(db: Session) -> Optional[str]:
    """Get the currently selected workcell name from settings.
    
    Returns:
        str: The selected workcell name, or None if no workcell is selected
    """
    try:
        workcell_setting = crud.settings.get_by(db, obj_in={"name": "workcell"})
        if not workcell_setting or not workcell_setting.is_active:
            return None
        return workcell_setting.value
    except Exception:
        return None


def get_selected_workcell_id(db: Session) -> Optional[int]:
    """Get the currently selected workcell ID from settings.
    
    Returns:
        int: The selected workcell ID, or None if no workcell is selected or doesn't exist
    """
    try:
        # Get the workcell setting
        workcell_setting = crud.settings.get_by(db, obj_in={"name": "workcell"})
        if not workcell_setting or not workcell_setting.is_active:
            return None
        
        # Get the workcell by name
        selected_workcell = crud.workcell.get_by(db, obj_in={"name": workcell_setting.value})
        if not selected_workcell:
            return None
        
        return selected_workcell.id
    except Exception:
        return None
    
def require_selected_workcell_name(db: Session) -> str:
    """Get the currently selected workcell name from settings.
    
    Raises:
        HTTPException: If no workcell is selected
    """
    workcell_name = get_selected_workcell_name(db)
    if not workcell_name:
        raise HTTPException(
            status_code=400, 
            detail="No workcell is currently selected. Please select a workcell in settings."
        )
    return workcell_name


def require_selected_workcell_id(db: Session) -> int:
    """Get the currently selected workcell ID from settings.
    
    Raises:
        HTTPException: If no workcell is selected or workcell doesn't exist
    """
    workcell_id = get_selected_workcell_id(db)
    if not workcell_id:
        raise HTTPException(
            status_code=400,
            detail="No workcell is currently selected or the selected workcell doesn't exist. Please select a workcell in settings."
        )
    return workcell_id