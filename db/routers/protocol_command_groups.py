from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from db import schemas, crud
import db.models.inventory_models as models
from ..dependencies import get_db

router = APIRouter()


@router.post("", response_model=schemas.ProtocolCommandGroup)
async def create_protocol_command_group(
    group: schemas.ProtocolCommandGroupCreate, 
    db: Session = Depends(get_db)
):
    """Create a new protocol command group."""
    try:
        # Verify process exists
        process = db.query(models.ProtocolProcess).get(group.process_id)
        if not process:
            raise HTTPException(
                status_code=404,
                detail=f"Protocol process with ID {group.process_id} not found"
            )

        db_group = crud.protocol_command_group.create(db=db, obj_in=group)
        return db_group

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating protocol command group: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating group: {str(e)}")


@router.get("", response_model=List[schemas.ProtocolCommandGroup])
async def get_protocol_command_groups(
    process_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all protocol command groups, optionally filtered by process_id."""
    if process_id is not None:
        groups = crud.protocol_command_group.get_all_by(
            db=db, 
            obj_in={"process_id": process_id}
        )
    else:
        groups = crud.protocol_command_group.get_all(db=db)
    
    return groups


@router.get("/{id}", response_model=schemas.ProtocolCommandGroup)
async def get_protocol_command_group(id: int, db: Session = Depends(get_db)):
    """Get a specific protocol command group by ID."""
    db_group = crud.protocol_command_group.get(db=db, id=id)
    if not db_group:
        raise HTTPException(status_code=404, detail="Protocol command group not found")
    return db_group


@router.put("/{id}", response_model=schemas.ProtocolCommandGroup)
async def update_protocol_command_group(
    id: int,
    group: schemas.ProtocolCommandGroupUpdate,
    db: Session = Depends(get_db)
):
    """Update a protocol command group."""
    db_group = crud.protocol_command_group.get(db=db, id=id)
    if not db_group:
        raise HTTPException(status_code=404, detail="Protocol command group not found")

    # If updating process_id, verify it exists
    if group.process_id is not None:
        process = db.query(models.ProtocolProcess).get(group.process_id)
        if not process:
            raise HTTPException(
                status_code=404,
                detail=f"Protocol process with ID {group.process_id} not found"
            )

    updated_group = crud.protocol_command_group.update(
        db=db, 
        db_obj=db_group, 
        obj_in=group
    )
    return updated_group


@router.delete("/{id}")
async def delete_protocol_command_group(id: int, db: Session = Depends(get_db)):
    """Delete a protocol command group and all its commands."""
    db_group = crud.protocol_command_group.get(db=db, id=id)
    if not db_group:
        raise HTTPException(status_code=404, detail="Protocol command group not found")

    crud.protocol_command_group.remove(db=db, id=id)
    return {"success": True, "message": "Protocol command group deleted successfully"}