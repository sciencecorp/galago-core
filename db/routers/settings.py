from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import typing as t

from db import crud, schemas
import db.models.inventory_models as models
from db.utils.audit import log_event
from ..dependencies import get_db

router = APIRouter()


@router.get("", response_model=list[schemas.AppSettings])
def get_settings(db: Session = Depends(get_db)) -> t.Any:
    return crud.settings.get_all(db)


@router.get("/{name}", response_model=schemas.AppSettings)
def get_setting(name: str, db: Session = Depends(get_db)) -> t.Any:
    setting = crud.settings.get_by(db, obj_in={"name": name})
    if setting is None:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting


@router.post("", response_model=schemas.AppSettingsCreate)
def create_setting(
    setting: schemas.AppSettingsCreate, db: Session = Depends(get_db)
) -> t.Any:
    return crud.settings.create(db, obj_in=setting)


@router.put("/{name}", response_model=schemas.AppSettingsUpdate)
def update_setting(
    name: str, setting_update: schemas.AppSettingsUpdate, db: Session = Depends(get_db)
) -> t.Any:
    settings = (
        db.query(models.AppSettings).filter(models.AppSettings.name == name).first()
    )
    if not settings:
        settings = crud.settings.create(
            db,
            obj_in=schemas.AppSettingsCreate(
                name=name,
                # Provide default empty string if None
                value=setting_update.value or "",
                is_active=True,
            ),
        )
    updated = crud.settings.update(db, db_obj=settings, obj_in=setting_update)
    log_event(
        db,
        action="settings.upsert",
        target_type="setting",
        target_name=name,
        details={
            "value_set": setting_update.value is not None,
            "is_active": setting_update.is_active,
        },
    )
    return updated
