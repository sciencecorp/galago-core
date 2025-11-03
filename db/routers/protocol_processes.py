from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from db import schemas, crud
import db.models.inventory_models as models
from ..dependencies import get_db

router = APIRouter()


@router.post("", response_model=schemas.ProtocolProcess)
async def create_protocol_process(
    process: schemas.ProtocolProcessCreate, 
    db: Session = Depends(get_db)
):
    """Create a new protocol process."""
    try:
        # Verify protocol exists
        protocol = db.query(models.Protocol).get(process.protocol_id)
        if not protocol:
            raise HTTPException(
                status_code=404,
                detail=f"Protocol with ID {process.protocol_id} not found"
            )

        db_process = crud.protocol_process.create(db=db, obj_in=process)
        return db_process

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating protocol process: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating process: {str(e)}")


@router.get("", response_model=List[schemas.ProtocolProcess])
async def get_protocol_processes(
    protocol_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all protocol processes, optionally filtered by protocol_id."""
    if protocol_id is not None:
        processes = crud.protocol_process.get_all_by(
            db=db, 
            obj_in={"protocol_id": protocol_id}
        )
    else:
        processes = crud.protocol_process.get_all(db=db)
    
    return processes


@router.get("/{id}", response_model=schemas.ProtocolProcess)
async def get_protocol_process(id: int, db: Session = Depends(get_db)):
    """Get a specific protocol process by ID."""
    db_process = crud.protocol_process.get(db=db, id=id)
    if not db_process:
        raise HTTPException(status_code=404, detail="Protocol process not found")
    return db_process


@router.put("/{id}", response_model=schemas.ProtocolProcess)
async def update_protocol_process(
    id: int,
    process: schemas.ProtocolProcessUpdate,
    db: Session = Depends(get_db)
):
    """Update a protocol process."""
    db_process = crud.protocol_process.get(db=db, id=id)
    if not db_process:
        raise HTTPException(status_code=404, detail="Protocol process not found")

    # If updating protocol_id, verify it exists
    if process.protocol_id is not None:
        protocol = db.query(models.Protocol).get(process.protocol_id)
        if not protocol:
            raise HTTPException(
                status_code=404,
                detail=f"Protocol with ID {process.protocol_id} not found"
            )

    updated_process = crud.protocol_process.update(
        db=db, 
        db_obj=db_process, 
        obj_in=process
    )
    return updated_process


@router.delete("/{id}")
async def delete_protocol_process(id: int, db: Session = Depends(get_db)):
    """Delete a protocol process and all its commands/command groups."""
    db_process = crud.protocol_process.get(db=db, id=id)
    if not db_process:
        raise HTTPException(status_code=404, detail="Protocol process not found")

    crud.protocol_process.remove(db=db, id=id)
    return {"success": True, "message": "Protocol process deleted successfully"}


@router.post("/{id}/reorder")
async def reorder_protocol_process(
    id: int,
    request: schemas.ReorderProcessRequest,  # Accept body instead of query param
    db: Session = Depends(get_db)
):
    """Reorder a protocol process within its protocol."""
    db_process = crud.protocol_process.get(db=db, id=id)
    if not db_process:
        raise HTTPException(status_code=404, detail="Protocol process not found")

    old_position = db_process.position
    protocol_id = db_process.protocol_id
    new_position = request.new_position

    # Get all processes for this protocol
    all_processes = crud.protocol_process.get_all_by(
        db=db, 
        obj_in={"protocol_id": protocol_id}
    )

    # Sort by position
    all_processes.sort(key=lambda p: p.position)

    # Update positions
    if new_position > old_position:
        # Moving down
        for process in all_processes:
            if old_position < process.position <= new_position:
                process.position -= 1
                db.add(process)
    else:
        # Moving up
        for process in all_processes:
            if new_position <= process.position < old_position:
                process.position += 1
                db.add(process)

    db_process.position = new_position
    db.add(db_process)
    db.commit()
    db.refresh(db_process)

    return {"success": True, "message": "Process reordered successfully"}