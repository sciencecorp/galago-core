from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import typing as t

from db import crud, schemas
from db.utils.audit import log_event
from ..dependencies import get_db

router = APIRouter()


@router.get("/settings", response_model=list[schemas.AppSettings])
def export_settings(db: Session = Depends(get_db)) -> t.Any:
    return crud.settings.get_all(db)


@router.post("/settings")
def import_settings(payload: dict, db: Session = Depends(get_db)) -> t.Any:
    """
    Import settings from a JSON payload:
      { "settings": [ { "name": "...", "value": "...", "is_active": true }, ... ] }
    Upserts each setting by name.
    """
    settings = (payload or {}).get("settings")
    if not isinstance(settings, list):
        raise HTTPException(
            status_code=400, detail="Expected payload.settings as a list"
        )

    upserted = 0
    for item in settings:
        if not isinstance(item, dict):
            continue
        name = item.get("name")
        value = item.get("value", "")
        is_active = item.get("is_active", True)
        if not name:
            continue
        existing = crud.settings.get_by(db, obj_in={"name": name})
        if existing is None:
            crud.settings.create(
                db,
                obj_in=schemas.AppSettingsCreate(
                    name=name, value=str(value), is_active=bool(is_active)
                ),
            )
        else:
            crud.settings.update(
                db,
                db_obj=existing,
                obj_in=schemas.AppSettingsUpdate(
                    value=str(value), is_active=bool(is_active)
                ),
            )
        upserted += 1

    log_event(
        db,
        action="backup.settings.import",
        target_type="backup",
        target_name="settings",
        details={"count": upserted},
    )
    return {"ok": True, "count": upserted}


@router.get("/secrets/meta", response_model=list[schemas.AppSecretMeta])
def export_secrets_meta(db: Session = Depends(get_db)) -> t.Any:
    """
    Export only secret metadata (never exports secret values).
    """
    secrets = crud.secrets.get_all(db)
    return [
        schemas.AppSecretMeta(
            name=s.name,
            is_active=s.is_active,
            is_set=True,
            created_at=s.created_at,
            updated_at=s.updated_at,
        )
        for s in secrets
    ]
