from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.encoders import jsonable_encoder
from starlette.background import BackgroundTask
from sqlalchemy.orm import Session
import typing as t
from typing import Optional
import json
import tempfile
import os
import logging

from db import crud, schemas
import db.models.inventory_models as models
from ..dependencies import get_db, get_selected_workcell_name, get_selected_workcell_id

router = APIRouter()


@router.get("", response_model=list[schemas.Labware])
def get_labwares(db: Session = Depends(get_db), workcell_name: Optional[str] = None) -> t.Any:
    # If no workcell_name provided or empty, use the selected workcell
    if not workcell_name:
        workcell_name = get_selected_workcell_name(db)
        
    workcell = crud.workcell.get_by(db, obj_in={"name": workcell_name})
    if not workcell:
        raise HTTPException(status_code=404, detail="Workcell not found")
    return crud.labware.get_all_by(db, obj_in={"workcell_id": workcell.id})


@router.post("", response_model=schemas.Labware)
def create_labware(
    labware: schemas.LabwareCreate, db: Session = Depends(get_db)
) -> t.Any:
    # If no workcell_id provided, use the selected workcell
    if not hasattr(labware, 'workcell_id') or labware.workcell_id is None:
        labware.workcell_id = get_selected_workcell_id(db)
    
    # Check for existing labware with same name in the same workcell
    existing_labware = crud.labware.get_by(
        db, obj_in={"name": labware.name, "workcell_id": labware.workcell_id}
    )
    if existing_labware:
        raise HTTPException(
            status_code=400,
            detail=f"Labware with name '{labware.name}' already exists in this workcell"
        )
    
    return crud.labware.create(db, obj_in=labware)


@router.get("/{labware_id}", response_model=schemas.Labware)
def get_labware(labware_id: int, db: Session = Depends(get_db)) -> t.Any:
    labware = crud.labware.get(db, id=labware_id)
    if labware is None:
        raise HTTPException(status_code=404, detail="Labware not found")
    return labware


@router.put("/{labware_id}", response_model=schemas.LabwareUpdate)
def update_labware(
    labware_id: int,
    labware_update: schemas.LabwareUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    labware = db.query(models.Labware).filter(models.Labware.id == labware_id).first()
    if not labware:
        raise HTTPException(status_code=404, detail="Labware not found")
    return crud.labware.update(db, db_obj=labware, obj_in=labware_update)


@router.delete("/{labware_id}", response_model=schemas.LabwareCreate)
def delete_labware(labware_id: int, db: Session = Depends(get_db)) -> t.Any:
    return crud.labware.remove(db, id=labware_id)


@router.get("/{labware_id}/export")
def export_labware_config(labware_id: int, db: Session = Depends(get_db)) -> t.Any:
    """Export a labware configuration as a downloadable JSON file."""
    labware = crud.labware.get(db, id=labware_id)
    if labware is None:
        raise HTTPException(status_code=404, detail="Labware not found")

    # Create a temporary file for the JSON content
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as temp_file:
        temp_file_path = temp_file.name
        # Serialize the labware to JSON and write to the file
        labware_json = jsonable_encoder(labware)
        temp_file.write(json.dumps(labware_json, indent=2).encode("utf-8"))

    # Set the filename for download
    filename = f"{labware.name.replace(' ', '_')}-config.json"

    # Return the file response which will trigger download in the browser
    return FileResponse(
        path=temp_file_path,
        filename=filename,
        media_type="application/json",
        background=BackgroundTask(
            lambda: os.unlink(temp_file_path)
        ),
    )


@router.post("/import", response_model=schemas.Labware)
async def import_labware_config(
    file: UploadFile = File(...), db: Session = Depends(get_db)
) -> t.Any:
    """Import a labware configuration from an uploaded JSON file."""
    try:
        # Read the uploaded file content
        file_content = await file.read()

        # Parse the JSON content
        try:
            labware_data = json.loads(file_content.decode("utf-8"))
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400, detail="Invalid JSON format in uploaded file"
            )

        # Check if basic required fields are present
        if not isinstance(labware_data, dict) or "name" not in labware_data:
            raise HTTPException(
                status_code=400,
                detail="Invalid labware configuration: Missing name field",
            )

        # Check if a labware with this name already exists
        existing_labware = crud.labware.get_by(
            db, obj_in={"name": labware_data["name"]}
        )

        # Extract labware fields
        labware_fields = {
            "name": labware_data["name"],
            "description": labware_data.get("description", ""),
            "number_of_rows": labware_data.get("number_of_rows", 8),
            "number_of_columns": labware_data.get("number_of_columns", 12),
            "z_offset": labware_data.get("z_offset", 0.0),
            "width": labware_data.get("width", 0.0),
            "height": labware_data.get("height", 0.0),
            "plate_lid_offset": labware_data.get("plate_lid_offset", 0.0),
            "lid_offset": labware_data.get("lid_offset", 0.0),
            "stack_height": labware_data.get("stack_height", 0.0),
            "has_lid": labware_data.get("has_lid", False),
            "image_url": labware_data.get("image_url", ""),
        }

        # Create or update the labware
        if existing_labware:
            # Update existing labware
            labware = crud.labware.update(
                db,
                db_obj=existing_labware,
                obj_in=schemas.LabwareUpdate(**labware_fields),
            )
        else:
            # Create new labware
            labware = crud.labware.create(
                db, obj_in=schemas.LabwareCreate(**labware_fields)
            )

        # Commit all changes
        db.commit()
        return labware

    except Exception as e:
        db.rollback()
        logging.error(f"Error importing labware configuration: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to import labware configuration: {str(e)}"
        )