import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import db.models.inventory_models as models
from db import crud, schemas

from ..dependencies import get_db

router = APIRouter()


@router.post("", response_model=schemas.BravoProtocolCommand)
async def create_bravo_protocol_command(
    command: schemas.BravoProtocolCommandCreate, db: Session = Depends(get_db)
):
    """Create a new Bravo protocol command."""
    try:
        # Verify protocol exists
        protocol = db.query(models.BravoProtocol).get(command.protocol_id)
        if not protocol:
            raise HTTPException(
                status_code=404,
                detail=f"Bravo protocol with ID {command.protocol_id} not found",
            )

        # If parent_command_id is specified, verify it exists
        if command.parent_command_id:
            parent = db.query(models.BravoProtocolCommand).get(
                command.parent_command_id
            )
            if not parent:
                raise HTTPException(
                    status_code=404,
                    detail=f"Parent command with ID {command.parent_command_id} not found",
                )
            # Verify parent is a loop or group
            if parent.command_type not in ["loop", "group"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Parent command must be of type 'loop' or 'group', got '{parent.command_type}'",
                )

        db_command = crud.bravo_protocol_command.create(db=db, obj_in=command)
        return db_command

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating bravo protocol command: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating command: {str(e)}")


@router.get("", response_model=List[schemas.BravoProtocolCommand])
async def get_bravo_protocol_commands(
    protocol_id: Optional[int] = None,
    parent_command_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Get all Bravo protocol commands, optionally filtered."""
    filters = {}
    if protocol_id is not None:
        filters["protocol_id"] = protocol_id
    if parent_command_id is not None:
        filters["parent_command_id"] = parent_command_id

    if filters:
        commands = crud.bravo_protocol_command.get_all_by(db=db, obj_in=filters)
    else:
        commands = crud.bravo_protocol_command.get_all(db=db)

    # Sort by position
    commands.sort(key=lambda c: c.position)
    return commands


@router.get("/{id}", response_model=schemas.BravoProtocolCommand)
async def get_bravo_protocol_command(id: int, db: Session = Depends(get_db)):
    """Get a specific Bravo protocol command by ID."""
    db_command = crud.bravo_protocol_command.get(db=db, id=id)
    if not db_command:
        raise HTTPException(status_code=404, detail="Bravo protocol command not found")
    return db_command


@router.put("/{id}", response_model=schemas.BravoProtocolCommand)
async def update_bravo_protocol_command(
    id: int,
    command: schemas.BravoProtocolCommandUpdate,
    db: Session = Depends(get_db),
):
    """Update a Bravo protocol command."""
    db_command = crud.bravo_protocol_command.get(db=db, id=id)
    if not db_command:
        raise HTTPException(status_code=404, detail="Bravo protocol command not found")

    # If updating protocol_id, verify it exists
    if command.protocol_id is not None:
        protocol = db.query(models.BravoProtocol).get(command.protocol_id)
        if not protocol:
            raise HTTPException(
                status_code=404,
                detail=f"Bravo protocol with ID {command.protocol_id} not found",
            )

    # If updating parent_command_id, verify it exists and is valid
    if command.parent_command_id is not None:
        parent = db.query(models.BravoProtocolCommand).get(command.parent_command_id)
        if not parent:
            raise HTTPException(
                status_code=404,
                detail=f"Parent command with ID {command.parent_command_id} not found",
            )
        if parent.command_type not in ["loop", "group"]:
            raise HTTPException(
                status_code=400,
                detail=f"Parent command must be of type 'loop' or 'group'",
            )

    updated_command = crud.bravo_protocol_command.update(
        db=db, db_obj=db_command, obj_in=command
    )
    return updated_command


@router.delete("/{id}")
async def delete_bravo_protocol_command(id: int, db: Session = Depends(get_db)):
    """Delete a Bravo protocol command and all its children."""
    db_command = crud.bravo_protocol_command.get(db=db, id=id)
    if not db_command:
        raise HTTPException(status_code=404, detail="Bravo protocol command not found")

    crud.bravo_protocol_command.remove(db=db, id=id)
    return {"success": True, "message": "Bravo protocol command deleted successfully"}


@router.post("/reorder")
async def reorder_bravo_protocol_commands(
    request: schemas.ReorderBravoCommandsRequest, db: Session = Depends(get_db)
):
    """Reorder multiple commands by providing ordered list of IDs."""
    try:
        # Validate all commands exist and belong to the protocol
        for command_id in request.command_ids:
            db_command = crud.bravo_protocol_command.get(db=db, id=command_id)
            if not db_command:
                raise HTTPException(
                    status_code=404, detail=f"Command {command_id} not found"
                )
            if db_command.protocol_id != request.protocol_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Command {command_id} does not belong to protocol {request.protocol_id}",
                )

        # Update positions based on order in the list
        for position, command_id in enumerate(request.command_ids):
            db_command = crud.bravo_protocol_command.get(db=db, id=command_id)
            if db_command:
                db_command.position = position
                db.add(db_command)

        db.commit()

        return {
            "success": True,
            "message": f"Reordered {len(request.command_ids)} commands successfully",
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error reordering commands: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error reordering: {str(e)}")


@router.post("/bulk-create", response_model=List[schemas.BravoProtocolCommand])
async def bulk_create_commands(
    commands: List[schemas.BravoProtocolCommandCreate], db: Session = Depends(get_db)
):
    """Create multiple Bravo protocol commands at once."""
    try:
        created_commands = []
        for command in commands:
            db_command = crud.bravo_protocol_command.create(db=db, obj_in=command)
            created_commands.append(db_command)

        return created_commands

    except Exception as e:
        db.rollback()
        logging.error(f"Error bulk creating commands: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error creating commands: {str(e)}"
        )
