import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import db.models.inventory_models as models
from db import crud, schemas

from ..dependencies import get_db

router = APIRouter()


@router.post("", response_model=schemas.BravoSequence)
async def create_bravo_sequence(
    sequence: schemas.BravoSequenceCreate, db: Session = Depends(get_db)
):
    """Create a new Bravo sequence."""
    try:
        # Verify tool exists and is of type 'bravo'
        tool = db.query(models.Tool).get(sequence.tool_id)
        if not tool:
            raise HTTPException(
                status_code=404, detail=f"Tool with ID {sequence.tool_id} not found"
            )
        if tool.type.lower() != "bravo":
            raise HTTPException(
                status_code=400,
                detail=f"Tool must be of type 'bravo', got '{tool.type}'",
            )

        db_sequence = crud.bravo_sequence.create(db=db, obj_in=sequence)
        return db_sequence

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating bravo sequence: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error creating sequence: {str(e)}"
        )


@router.get("", response_model=List[schemas.BravoSequence])
async def get_bravo_sequences(
    tool_id: Optional[int] = None, db: Session = Depends(get_db)
):
    """Get all Bravo sequences, optionally filtered by tool_id."""
    if tool_id is not None:
        sequences = crud.bravo_sequence.get_all_by(db=db, obj_in={"tool_id": tool_id})
    else:
        sequences = crud.bravo_sequence.get_all(db=db)

    return sequences


@router.get("/{id}", response_model=schemas.BravoSequence)
async def get_bravo_sequence(id: int, db: Session = Depends(get_db)):
    """Get a specific Bravo sequence by ID."""
    db_sequence = crud.bravo_sequence.get(db=db, id=id)
    if not db_sequence:
        raise HTTPException(status_code=404, detail="Bravo sequence not found")
    return db_sequence


@router.put("/{id}", response_model=schemas.BravoSequence)
async def update_bravo_sequence(
    id: int, sequence: schemas.BravoSequenceUpdate, db: Session = Depends(get_db)
):
    """Update a Bravo sequence."""
    db_sequence = crud.bravo_sequence.get(db=db, id=id)
    if not db_sequence:
        raise HTTPException(status_code=404, detail="Bravo sequence not found")

    # If updating tool_id, verify it exists and is of type 'bravo'
    if sequence.tool_id is not None:
        tool = db.query(models.Tool).get(sequence.tool_id)
        if not tool:
            raise HTTPException(
                status_code=404, detail=f"Tool with ID {sequence.tool_id} not found"
            )
        if tool.type.lower() != "bravo":
            raise HTTPException(
                status_code=400,
                detail=f"Tool must be of type 'bravo', got '{tool.type}'",
            )

    updated_sequence = crud.bravo_sequence.update(
        db=db, db_obj=db_sequence, obj_in=sequence
    )
    return updated_sequence


@router.delete("/{id}")
async def delete_bravo_sequence(id: int, db: Session = Depends(get_db)):
    """Delete a Bravo sequence and all its steps."""
    db_sequence = crud.bravo_sequence.get(db=db, id=id)
    if not db_sequence:
        raise HTTPException(status_code=404, detail="Bravo sequence not found")

    crud.bravo_sequence.remove(db=db, id=id)
    return {"success": True, "message": "Bravo sequence deleted successfully"}
