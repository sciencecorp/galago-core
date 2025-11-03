from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from db import schemas, crud
import db.models.inventory_models as models
from ..dependencies import get_db

router = APIRouter()

@router.post("", response_model=schemas.ProtocolCommand)
async def create_protocol_command(
    command: schemas.ProtocolCommandCreate, 
    db: Session = Depends(get_db)
):
    # Get protocol_id from the process if not provided
    if not command.protocol_id and command.process_id:
        process = db.query(models.ProtocolProcess).get(command.process_id)
        if process:
            command.protocol_id = process.protocol_id
    
    db_command = crud.protocol_command.create(db=db, obj_in=command)
    return db_command

@router.get("", response_model=List[schemas.ProtocolCommand])
async def get_protocol_commands(
    protocol_id: Optional[int] = None,
    process_id: Optional[int] = None,
    command_group_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all protocol commands, optionally filtered."""
    filters = {}
    if protocol_id is not None:
        filters["protocol_id"] = protocol_id
    if process_id is not None:
        filters["process_id"] = process_id
    if command_group_id is not None:
        filters["command_group_id"] = command_group_id

    if filters:
        commands = crud.protocol_command.get_all_by(db=db, obj_in=filters)
    else:
        commands = crud.protocol_command.get_all(db=db)
    
    # Sort by position
    commands.sort(key=lambda c: c.position if c.position else 0)
    return commands


@router.get("/{id}", response_model=schemas.ProtocolCommand)
async def get_protocol_command(id: int, db: Session = Depends(get_db)):
    """Get a specific protocol command by ID."""
    db_command = crud.protocol_command.get(db=db, id=id)
    if not db_command:
        raise HTTPException(status_code=404, detail="Protocol command not found")
    return db_command


@router.put("/{id}", response_model=schemas.ProtocolCommand)
async def update_protocol_command(
    id: int,
    command: schemas.ProtocolCommandUpdate,
    db: Session = Depends(get_db)
):
    """Update a protocol command."""
    db_command = crud.protocol_command.get(db=db, id=id)
    if not db_command:
        raise HTTPException(status_code=404, detail="Protocol command not found")

    if command.process_id is not None:
        process = db.query(models.ProtocolProcess).get(command.process_id)
        if not process:
            raise HTTPException(
                status_code=404,
                detail=f"Protocol process with ID {command.process_id} not found"
            )

    if command.command_group_id is not None:
        group = db.query(models.ProtocolCommandGroup).get(command.command_group_id)
        if not group:
            raise HTTPException(
                status_code=404,
                detail=f"Protocol command group with ID {command.command_group_id} not found"
            )

    updated_command = crud.protocol_command.update(
        db=db, 
        db_obj=db_command, 
        obj_in=command
    )
    return updated_command


@router.delete("/{id}")
async def delete_protocol_command(id: int, db: Session = Depends(get_db)):
    """Delete a protocol command."""
    db_command = crud.protocol_command.get(db=db, id=id)
    if not db_command:
        raise HTTPException(status_code=404, detail="Protocol command not found")

    crud.protocol_command.remove(db=db, id=id)
    return {"success": True, "message": "Protocol command deleted successfully"}


from pydantic import BaseModel

# Add this model at the top with other imports
class ReorderCommandsRequest(BaseModel):
    process_id: int
    command_ids: List[int]

from pydantic import BaseModel

# Add this model near the top with imports
class ReorderCommandsRequest(BaseModel):
    process_id: int
    command_ids: List[int]

# Replace the /reorder endpoint:
@router.post("/reorder")
async def reorder_protocol_commands(
    request: ReorderCommandsRequest,
    db: Session = Depends(get_db)
):
    """Reorder multiple commands by providing ordered list of IDs."""
    try:
        # Validate all commands exist and belong to the process
        for command_id in request.command_ids:
            db_command = crud.protocol_command.get(db=db, id=command_id)
            if not db_command:
                raise HTTPException(
                    status_code=404,
                    detail=f"Command {command_id} not found"
                )
            if db_command.process_id != request.process_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Command {command_id} does not belong to process {request.process_id}"
                )
        
        # Update positions based on order in the list
        for position, command_id in enumerate(request.command_ids):
            db_command = crud.protocol_command.get(db=db, id=command_id)
            if db_command:
                db_command.position = position
                db.add(db_command)  # Mark for update
        
        db.commit()  # Commit all changes
        
        return {"success": True, "message": f"Reordered {len(request.command_ids)} commands successfully"}
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error reordering commands: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error reordering: {str(e)}")

@router.post("/bulk-create", response_model=List[schemas.ProtocolCommand])
async def bulk_create_commands(
    commands: List[schemas.ProtocolCommandCreate],
    db: Session = Depends(get_db)
):
    """Create multiple protocol commands at once."""
    try:
        created_commands = []
        for command in commands:
            db_command = crud.protocol_command.create(db=db, obj_in=command)
            created_commands.append(db_command)
        
        return created_commands

    except Exception as e:
        db.rollback()
        logging.error(f"Error bulk creating commands: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating commands: {str(e)}")


@router.delete("/bulk-delete")
async def bulk_delete_commands(
    command_ids: List[int],
    db: Session = Depends(get_db)
):
    """Delete multiple protocol commands at once."""
    try:
        deleted_count = 0
        for command_id in command_ids:
            db_command = crud.protocol_command.get(db=db, id=command_id)
            if db_command:
                crud.protocol_command.remove(db=db, id=command_id)
                deleted_count += 1
        
        return {
            "success": True, 
            "message": f"Deleted {deleted_count} commands successfully"
        }

    except Exception as e:
        db.rollback()
        logging.error(f"Error bulk deleting commands: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting commands: {str(e)}")