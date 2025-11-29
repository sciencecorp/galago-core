import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import db.models.inventory_models as models
from db import crud, schemas

from ..dependencies import get_db, get_selected_workcell_name

router = APIRouter()


@router.post("", response_model=schemas.BravoDeckConfig)
async def create_bravo_deck_config(
    config: schemas.BravoDeckConfigCreate, db: Session = Depends(get_db)
):
    """Create a new Bravo deck configuration."""
    try:
        # Verify workcell exists
        workcell = db.query(models.Workcell).get(config.workcell_id)
        if not workcell:
            raise HTTPException(
                status_code=404,
                detail=f"Workcell with ID {config.workcell_id} not found",
            )

        db_config = crud.bravo_deck_config.create(db=db, obj_in=config)
        return db_config

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Error creating bravo deck config: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error creating deck config: {str(e)}"
        )


@router.get("", response_model=List[schemas.BravoDeckConfig])
async def get_bravo_deck_configs(
    workcell_id: Optional[int] = None,
    workcell_name: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Get all Bravo deck configurations, optionally filtered by workcell."""
    try:
        # If workcell_name provided, get workcell_id
        if workcell_name and not workcell_id:
            workcell = crud.workcell.get_by(db, obj_in={"name": workcell_name})
            if workcell:
                workcell_id = workcell.id

        # If no workcell specified, use selected workcell
        if not workcell_id:
            workcell_name = get_selected_workcell_name(db)
            workcell = crud.workcell.get_by(db, obj_in={"name": workcell_name})
            if workcell:
                workcell_id = workcell.id

        if workcell_id is not None:
            configs = crud.bravo_deck_config.get_all_by(
                db=db, obj_in={"workcell_id": workcell_id}
            )
        else:
            configs = crud.bravo_deck_config.get_all(db=db)

        return configs

    except Exception as e:
        logging.error(f"Error getting bravo deck configs: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error getting deck configs: {str(e)}"
        )


@router.get("/{id}", response_model=schemas.BravoDeckConfig)
async def get_bravo_deck_config(id: int, db: Session = Depends(get_db)):
    """Get a specific Bravo deck configuration by ID."""
    db_config = crud.bravo_deck_config.get(db=db, id=id)
    if not db_config:
        raise HTTPException(status_code=404, detail="Bravo deck config not found")
    return db_config


@router.put("/{id}", response_model=schemas.BravoDeckConfig)
async def update_bravo_deck_config(
    id: int, config: schemas.BravoDeckConfigUpdate, db: Session = Depends(get_db)
):
    """Update a Bravo deck configuration."""
    db_config = crud.bravo_deck_config.get(db=db, id=id)
    if not db_config:
        raise HTTPException(status_code=404, detail="Bravo deck config not found")

    # If updating workcell_id, verify it exists
    if config.workcell_id is not None:
        workcell = db.query(models.Workcell).get(config.workcell_id)
        if not workcell:
            raise HTTPException(
                status_code=404,
                detail=f"Workcell with ID {config.workcell_id} not found",
            )

    try:
        updated_config = crud.bravo_deck_config.update(
            db=db, db_obj=db_config, obj_in=config
        )
        return updated_config
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}")
async def delete_bravo_deck_config(id: int, db: Session = Depends(get_db)):
    """Delete a Bravo deck configuration."""
    db_config = crud.bravo_deck_config.get(db=db, id=id)
    if not db_config:
        raise HTTPException(status_code=404, detail="Bravo deck config not found")

    crud.bravo_deck_config.remove(db=db, id=id)
    return {"success": True, "message": "Bravo deck config deleted successfully"}
