from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import typing as t

from db import crud, schemas
import db.models.inventory_models as models
from db.utils.crypto import encrypt_secret, secrets_key_status
from db.utils.audit import log_event
from ..dependencies import get_db

router = APIRouter()


@router.get("/status")
def secrets_status() -> t.Any:
    configured, message = secrets_key_status()
    return {"configured": configured, "message": message}


@router.get("", response_model=list[schemas.AppSecretMeta])
def list_secrets(db: Session = Depends(get_db)) -> t.Any:
    """
    List secret metadata only (never returns plaintext secret values).
    """
    secrets = crud.secrets.get_all(db)
    # Ensure response includes `is_set` without exposing encrypted_value
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


@router.put("/{name}", response_model=schemas.AppSecretMeta)
def set_secret(
    name: str, body: schemas.AppSecretSet, db: Session = Depends(get_db)
) -> t.Any:
    """
    Upsert a secret value by name (stores encrypted at rest).
    """
    if not name or not name.strip():
        raise HTTPException(status_code=400, detail="Secret name is required")
    if body.value is None or body.value == "":
        raise HTTPException(status_code=400, detail="Secret value is required")

    existing = crud.secrets.get_by(db, obj_in={"name": name})
    try:
        encrypted_value = encrypt_secret(body.value)
    except RuntimeError as e:
        # Most common: GALAGO_SECRETS_KEY missing/invalid
        raise HTTPException(status_code=500, detail=str(e))

    if existing is None:
        created = models.AppSecret(
            name=name,
            encrypted_value=encrypted_value,
            is_active=body.is_active,
        )
        db.add(created)
        db.commit()
        db.refresh(created)
        s = created
    else:
        existing.encrypted_value = encrypted_value
        existing.is_active = body.is_active
        db.add(existing)
        db.commit()
        db.refresh(existing)
        s = existing

    log_event(
        db,
        action="secrets.set",
        target_type="secret",
        target_name=name,
        details={"is_active": body.is_active},
    )

    return schemas.AppSecretMeta(
        name=s.name,
        is_active=s.is_active,
        is_set=True,
        created_at=s.created_at,
        updated_at=s.updated_at,
    )


@router.delete("/{name}")
def clear_secret(name: str, db: Session = Depends(get_db)) -> t.Any:
    existing = crud.secrets.get_by(db, obj_in={"name": name})
    if existing is None:
        # Idempotent delete
        return {"message": "Secret not found"}
    db.delete(existing)
    db.commit()
    log_event(
        db, action="secrets.clear", target_type="secret", target_name=name, details=None
    )
    return {"message": "Secret cleared"}
