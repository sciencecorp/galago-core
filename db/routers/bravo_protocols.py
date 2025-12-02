import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import db.models.inventory_models as models
from db import crud, schemas

from ..dependencies import get_db

router = APIRouter()


@router.post("", response_model=schemas.BravoProtocol)
async def create_bravo_protocol(
    protocol: schemas.BravoProtocolCreate, db: Session = Depends(get_db)
):
    """Create a new Bravo protocol."""
    try:
        # Verify tool exists and is of type 'bravo'
        tool = db.query(models.Tool).get(protocol.tool_id)
        if not tool:
            raise HTTPException(
                status_code=404, detail=f"Tool with ID {protocol.tool_id} not found"
            )
        if tool.type.lower() != "bravo":
            raise HTTPException(
                status_code=400,
                detail=f"Tool must be of type 'bravo', got '{tool.type}'",
            )

        db_protocol = crud.bravo_protocol.create(db=db, obj_in=protocol)
        return db_protocol

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating bravo protocol: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error creating protocol: {str(e)}"
        )


@router.get("", response_model=List[schemas.BravoProtocol])
async def get_bravo_protocols(
    tool_id: Optional[int] = None, db: Session = Depends(get_db)
):
    """Get all Bravo protocols, optionally filtered by tool_id."""
    if tool_id is not None:
        protocols = crud.bravo_protocol.get_all_by(db=db, obj_in={"tool_id": tool_id})
    else:
        protocols = crud.bravo_protocol.get_all(db=db)

    return protocols


@router.get("/{id}", response_model=schemas.BravoProtocol)
async def get_bravo_protocol(id: int, db: Session = Depends(get_db)):
    """Get a specific Bravo protocol by ID."""
    db_protocol = crud.bravo_protocol.get(db=db, id=id)
    if not db_protocol:
        raise HTTPException(status_code=404, detail="Bravo protocol not found")
    return db_protocol


@router.put("/{id}", response_model=schemas.BravoProtocol)
async def update_bravo_protocol(
    id: int, protocol: schemas.BravoProtocolUpdate, db: Session = Depends(get_db)
):
    """Update a Bravo protocol."""
    db_protocol = crud.bravo_protocol.get(db=db, id=id)
    if not db_protocol:
        raise HTTPException(status_code=404, detail="Bravo protocol not found")

    # If updating tool_id, verify it exists and is of type 'bravo'
    if protocol.tool_id is not None:
        tool = db.query(models.Tool).get(protocol.tool_id)
        if not tool:
            raise HTTPException(
                status_code=404, detail=f"Tool with ID {protocol.tool_id} not found"
            )
        if tool.type.lower() != "bravo":
            raise HTTPException(
                status_code=400,
                detail=f"Tool must be of type 'bravo', got '{tool.type}'",
            )

    updated_protocol = crud.bravo_protocol.update(
        db=db, db_obj=db_protocol, obj_in=protocol
    )
    return updated_protocol


@router.delete("/{id}")
async def delete_bravo_protocol(id: int, db: Session = Depends(get_db)):
    """Delete a Bravo protocol and all its commands."""
    db_protocol = crud.bravo_protocol.get(db=db, id=id)
    if not db_protocol:
        raise HTTPException(status_code=404, detail="Bravo protocol not found")

    crud.bravo_protocol.remove(db=db, id=id)
    return {"success": True, "message": "Bravo protocol deleted successfully"}


@router.put("/{id}/commands", response_model=List[schemas.BravoProtocolCommand])
async def update_protocol_commands(
    id: int,
    commands: List[schemas.BravoProtocolCommandCreate],
    db: Session = Depends(get_db),
):
    """Replace all commands for a protocol."""
    try:
        # Verify protocol exists
        db_protocol = crud.bravo_protocol.get(db=db, id=id)
        if not db_protocol:
            raise HTTPException(status_code=404, detail="Bravo protocol not found")

        # Delete existing commands (cascade will handle children)
        existing_commands = crud.bravo_protocol_command.get_all_by(
            db=db, obj_in={"protocol_id": id, "parent_command_id": None}
        )
        for command in existing_commands:
            crud.bravo_protocol_command.remove(db=db, id=command.id)

        # Create new commands
        created_commands = []
        for command_data in commands:
            command_dict = command_data.dict()
            command_dict["protocol_id"] = id
            db_command = crud.bravo_protocol_command.create(
                db=db, obj_in=schemas.BravoProtocolCommandCreate(**command_dict)
            )
            created_commands.append(db_command)

        return created_commands

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error updating protocol commands: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error updating commands: {str(e)}"
        )
