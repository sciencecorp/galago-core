import typing as t
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import db.models.inventory_models as models
from db import crud, schemas

from ..dependencies import get_db, get_selected_workcell_id

router = APIRouter()


@router.get("", response_model=list[schemas.BravoDeckConfig])
def get_bravo_deck_configs(
    db: Session = Depends(get_db), workcell_id: Optional[int] = None
) -> t.Any:
    """Get all Bravo deck configurations for the selected workcell."""
    # If no workcell_id provided, use the selected workcell
    if workcell_id is None:
        workcell_id = get_selected_workcell_id(db)

    configs = crud.bravo_deck_config.get_all_by(db, obj_in={"workcell_id": workcell_id})
    return configs


@router.get("/{config_id}", response_model=schemas.BravoDeckConfig)
def get_bravo_deck_config(config_id: int, db: Session = Depends(get_db)) -> t.Any:
    """Get a specific Bravo deck configuration by ID."""
    config = crud.bravo_deck_config.get(db, id=config_id)
    if config is None:
        raise HTTPException(
            status_code=404, detail="Bravo deck configuration not found"
        )
    return config


@router.post("", response_model=schemas.BravoDeckConfig)
def create_bravo_deck_config(
    config: schemas.BravoDeckConfigCreate, db: Session = Depends(get_db)
) -> t.Any:
    """Create a new Bravo deck configuration."""
    # Auto-inject workcell_id from selected workcell
    workcell_id = get_selected_workcell_id(db)

    # Check for existing config with same name in this workcell
    existing_config = crud.bravo_deck_config.get_by(
        db, obj_in={"name": config.name, "workcell_id": workcell_id}
    )
    if existing_config:
        raise HTTPException(
            status_code=400,
            detail=f"Bravo deck configuration with name '{config.name}' already exists in this workcell",
        )

    # Create config with workcell_id
    config_data = config.dict()
    config_data["workcell_id"] = workcell_id

    new_config = crud.bravo_deck_config.create(db, obj_in=config_data)
    return new_config


@router.put("/{config_id}", response_model=schemas.BravoDeckConfig)
def update_bravo_deck_config(
    config_id: int,
    config_update: schemas.BravoDeckConfigUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    """Update a Bravo deck configuration."""
    config = crud.bravo_deck_config.get(db, id=config_id)
    if not config:
        raise HTTPException(
            status_code=404, detail="Bravo deck configuration not found"
        )

    # If name is being updated, check for duplicates
    if config_update.name and config_update.name != config.name:
        existing_config = crud.bravo_deck_config.get_by(
            db, obj_in={"name": config_update.name, "workcell_id": config.workcell_id}
        )
        if existing_config:
            raise HTTPException(
                status_code=400,
                detail=f"Bravo deck configuration with name '{config_update.name}' already exists in this workcell",
            )

    updated_config = crud.bravo_deck_config.update(
        db, db_obj=config, obj_in=config_update
    )
    return updated_config


@router.delete("/{config_id}", response_model=schemas.BravoDeckConfig)
def delete_bravo_deck_config(config_id: int, db: Session = Depends(get_db)) -> t.Any:
    """Delete a Bravo deck configuration."""
    config = crud.bravo_deck_config.get(db, id=config_id)
    if config is None:
        raise HTTPException(
            status_code=404, detail="Bravo deck configuration not found"
        )

    deleted_config = crud.bravo_deck_config.remove(db, id=config_id)
    return deleted_config
