from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import typing as t
from typing import Optional, Dict, Any

from db import crud, schemas
from ..dependencies import log_db

router = APIRouter()


@router.get("", response_model=list[schemas.Log])
async def get_logs(
    db: Session = Depends(log_db),
    skip: int = 0,
    limit: int = 100,
    order_by: Optional[str] = None,
    descending: bool = False,
    filters: Optional[Dict[str, Any]] = None,
) -> t.Any:
    return crud.logs.paginate(
        db,
        skip=skip,
        limit=limit,
        order_by=order_by,
        descending=descending,
        filters=filters,
    )


@router.post("", response_model=schemas.Log)
async def create_log(log: schemas.LogCreate, db: Session = Depends(log_db)) -> t.Any:
    return crud.logs.create(db, obj_in=log)
