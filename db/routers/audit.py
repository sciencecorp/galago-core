from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import typing as t

from db import schemas
import db.models.inventory_models as models
from ..dependencies import get_db

router = APIRouter()


@router.get("", response_model=list[schemas.AppAuditEvent])
def list_audit_events(
    limit: int = 100,
    db: Session = Depends(get_db),
) -> t.Any:
    limit = max(1, min(limit, 500))
    return (
        db.query(models.AppAuditEvent)
        .order_by(models.AppAuditEvent.id.desc())
        .limit(limit)
        .all()
    )
