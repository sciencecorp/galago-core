import json
import logging
import os
import tempfile
import typing as t
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from starlette.background import BackgroundTask

import db.models.inventory_models as models
from db import schemas

from ..dependencies import get_db, get_selected_workcell_id

router = APIRouter()


@router.post("", response_model=schemas.Protocol)
async def create_protocol(
    protocol: schemas.ProtocolCreate, db: Session = Depends(get_db)
):
    try:
        # If no workcell_id provided, use the selected workcell
        workcell_id = protocol.workcell_id
        if workcell_id is None:
            workcell_id = get_selected_workcell_id(db)
            if workcell_id is None:
                raise HTTPException(
                    status_code=400,
                    detail="No workcell selected. Please select a workcell or provide workcell_id.",
                )

        # Check if workcell exists
        workcell = db.query(models.Workcell).get(workcell_id)
        if not workcell:
            logging.error(f"Workcell with ID {workcell_id} not found")
            raise HTTPException(
                status_code=400,
                detail=f"Workcell with ID {workcell_id} not found",
            )

        # Create new protocol with validated data
        db_protocol = models.Protocol(
            name=protocol.name,
            category=protocol.category,
            workcell_id=workcell_id,
            description=protocol.description,
            commands=protocol.commands or [],
        )

        try:
            db.add(db_protocol)
            db.flush()  # Flush to get the ID without committing

            # Verify the protocol can be converted to dict (catches serialization issues)
            db.commit()
            db.refresh(db_protocol)
            return db_protocol

        except Exception as e:
            db.rollback()
            logging.error(f"Database error while creating protocol: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Unexpected error while creating protocol: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.put("/{id}", response_model=schemas.Protocol)
async def update_protocol(
    id: int, protocol: schemas.ProtocolUpdate, db: Session = Depends(get_db)
):
    db_protocol = db.query(models.Protocol).get(id)
    if not db_protocol:
        raise HTTPException(status_code=404, detail="Protocol not found")

    update_data = protocol.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_protocol, key, value)

    db.commit()
    db.refresh(db_protocol)
    return db_protocol


@router.delete("/{id}")
async def delete_protocol(id: int, db: Session = Depends(get_db)):
    db_protocol = db.query(models.Protocol).get(id)
    if not db_protocol:
        raise HTTPException(status_code=404, detail="Protocol not found")

    db.delete(db_protocol)
    db.commit()
    return {"success": True}


@router.get("/{id}", response_model=schemas.Protocol)
async def get_protocol(id: int, db: Session = Depends(get_db)):
    db_protocol = db.query(models.Protocol).get(id)
    if not db_protocol:
        raise HTTPException(status_code=404, detail="Protocol not found")
    return db_protocol


@router.get("/{id}/export")
async def export_protocol(id: int, db: Session = Depends(get_db)) -> t.Any:
    """Export a protocol as a downloadable JSON file."""
    # Get the protocol
    db_protocol = db.query(models.Protocol).get(id)
    if not db_protocol:
        raise HTTPException(status_code=404, detail="Protocol not found")

    # Build export data
    export_data = {
        "protocol": {
            "name": db_protocol.name,
            "category": db_protocol.category,
            "description": db_protocol.description,
            "commands": db_protocol.commands,
        },
        "exportedAt": datetime.utcnow().isoformat(),
        "version": "1.0",
    }

    # Create a temporary file for the JSON content
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as temp_file:
        temp_file_path = temp_file.name
        temp_file.write(json.dumps(export_data, indent=2).encode("utf-8"))

    # Set the filename for download
    filename = f"{db_protocol.name.replace(' ', '_')}-protocol.json"

    # Return the file response which will trigger download in the browser
    return FileResponse(
        path=temp_file_path,
        filename=filename,
        media_type="application/json",
        background=BackgroundTask(
            lambda: os.unlink(temp_file_path)
        ),  # Delete the temp file after response is sent
    )


@router.post("/import", response_model=schemas.Protocol)
async def import_protocol(
    file: UploadFile = File(...),
    workcell_id: int = Form(...),
    db: Session = Depends(get_db),
) -> t.Any:
    """Import a protocol from an uploaded JSON file."""
    try:
        # Read the uploaded file content
        file_content = await file.read()
        import_data = json.loads(file_content.decode("utf-8"))

        # Validate the import data structure
        if "protocol" not in import_data or "name" not in import_data["protocol"]:
            raise HTTPException(status_code=400, detail="Invalid protocol export file")

        protocol_data = import_data["protocol"]

        # Check if workcell exists
        workcell = db.query(models.Workcell).get(workcell_id)
        if not workcell:
            raise HTTPException(
                status_code=400,
                detail=f"Workcell with ID {workcell_id} not found",
            )

        # Create the protocol
        db_protocol = models.Protocol(
            name=protocol_data["name"],
            category=protocol_data.get("category", "development"),
            description=protocol_data.get("description"),
            commands=protocol_data.get("commands", []),
            workcell_id=workcell_id,
        )

        db.add(db_protocol)
        db.commit()
        db.refresh(db_protocol)

        return db_protocol

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


@router.get("", response_model=List[schemas.Protocol])
async def get_protocols(
    workcell_id: Optional[int] = None,
    workcell_name: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Protocol)

    if workcell_id is not None:
        query = query.filter(models.Protocol.workcell_id == workcell_id)
    elif workcell_name is not None:
        # Get workcell by name and then filter by its ID
        workcell = (
            db.query(models.Workcell)
            .filter(models.Workcell.name == workcell_name)
            .first()
        )
        if workcell:
            query = query.filter(models.Protocol.workcell_id == workcell.id)
        else:
            # If workcell not found, return empty list
            return []

    protocols = query.all()
    return [protocol for protocol in protocols]
