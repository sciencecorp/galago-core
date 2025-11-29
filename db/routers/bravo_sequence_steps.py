import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import db.models.inventory_models as models
from db import crud, schemas

from ..dependencies import get_db

router = APIRouter()


@router.post("", response_model=schemas.BravoSequenceStep)
async def create_bravo_sequence_step(
    step: schemas.BravoSequenceStepCreate, db: Session = Depends(get_db)
):
    """Create a new Bravo sequence step."""
    try:
        # Verify sequence exists
        sequence = db.query(models.BravoSequence).get(step.sequence_id)
        if not sequence:
            raise HTTPException(
                status_code=404,
                detail=f"Bravo sequence with ID {step.sequence_id} not found",
            )

        db_step = crud.bravo_sequence_step.create(db=db, obj_in=step)
        return db_step

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating bravo sequence step: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating step: {str(e)}")


@router.get("", response_model=List[schemas.BravoSequenceStep])
async def get_bravo_sequence_steps(
    sequence_id: Optional[int] = None, db: Session = Depends(get_db)
):
    """Get all Bravo sequence steps, optionally filtered by sequence_id."""
    if sequence_id is not None:
        steps = crud.bravo_sequence_step.get_all_by(
            db=db, obj_in={"sequence_id": sequence_id}
        )
    else:
        steps = crud.bravo_sequence_step.get_all(db=db)

    # Sort by position
    steps.sort(key=lambda s: s.position)
    return steps


@router.get("/{id}", response_model=schemas.BravoSequenceStep)
async def get_bravo_sequence_step(id: int, db: Session = Depends(get_db)):
    """Get a specific Bravo sequence step by ID."""
    db_step = crud.bravo_sequence_step.get(db=db, id=id)
    if not db_step:
        raise HTTPException(status_code=404, detail="Bravo sequence step not found")
    return db_step


@router.put("/{id}", response_model=schemas.BravoSequenceStep)
async def update_bravo_sequence_step(
    id: int, step: schemas.BravoSequenceStepUpdate, db: Session = Depends(get_db)
):
    """Update a Bravo sequence step."""
    db_step = crud.bravo_sequence_step.get(db=db, id=id)
    if not db_step:
        raise HTTPException(status_code=404, detail="Bravo sequence step not found")

    # If updating sequence_id, verify it exists
    if step.sequence_id is not None:
        sequence = db.query(models.BravoSequence).get(step.sequence_id)
        if not sequence:
            raise HTTPException(
                status_code=404,
                detail=f"Bravo sequence with ID {step.sequence_id} not found",
            )

    updated_step = crud.bravo_sequence_step.update(db=db, db_obj=db_step, obj_in=step)
    return updated_step


@router.delete("/{id}")
async def delete_bravo_sequence_step(id: int, db: Session = Depends(get_db)):
    """Delete a Bravo sequence step."""
    db_step = crud.bravo_sequence_step.get(db=db, id=id)
    if not db_step:
        raise HTTPException(status_code=404, detail="Bravo sequence step not found")

    crud.bravo_sequence_step.remove(db=db, id=id)
    return {"success": True, "message": "Bravo sequence step deleted successfully"}


@router.post("/reorder")
async def reorder_bravo_sequence_steps(
    request: schemas.ReorderBravoStepsRequest, db: Session = Depends(get_db)
):
    """Reorder multiple steps by providing ordered list of IDs."""
    try:
        # Validate all steps exist and belong to the sequence
        for step_id in request.step_ids:
            db_step = crud.bravo_sequence_step.get(db=db, id=step_id)
            if not db_step:
                raise HTTPException(status_code=404, detail=f"Step {step_id} not found")
            if db_step.sequence_id != request.sequence_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Step {step_id} does not belong to sequence {request.sequence_id}",
                )

        # Update positions based on order in the list
        for position, step_id in enumerate(request.step_ids):
            db_step = crud.bravo_sequence_step.get(db=db, id=step_id)
            if db_step:
                db_step.position = position
                db.add(db_step)

        db.commit()

        return {
            "success": True,
            "message": f"Reordered {len(request.step_ids)} steps successfully",
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error reordering steps: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error reordering: {str(e)}")


@router.post("/bulk-create", response_model=List[schemas.BravoSequenceStep])
async def bulk_create_steps(
    steps: List[schemas.BravoSequenceStepCreate], db: Session = Depends(get_db)
):
    """Create multiple Bravo sequence steps at once."""
    try:
        created_steps = []
        for step in steps:
            db_step = crud.bravo_sequence_step.create(db=db, obj_in=step)
            created_steps.append(db_step)

        return created_steps

    except Exception as e:
        db.rollback()
        logging.error(f"Error bulk creating steps: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating steps: {str(e)}")


@router.delete("/bulk-delete")
async def bulk_delete_steps(step_ids: List[int], db: Session = Depends(get_db)):
    """Delete multiple Bravo sequence steps at once."""
    try:
        deleted_count = 0
        for step_id in step_ids:
            db_step = crud.bravo_sequence_step.get(db=db, id=step_id)
            if db_step:
                crud.bravo_sequence_step.remove(db=db, id=step_id)
                deleted_count += 1

        return {
            "success": True,
            "message": f"Deleted {deleted_count} steps successfully",
        }

    except Exception as e:
        db.rollback()
        logging.error(f"Error bulk deleting steps: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting steps: {str(e)}")
