from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.encoders import jsonable_encoder
from starlette.background import BackgroundTask
from sqlalchemy.orm import Session
from datetime import datetime
import typing as t
from typing import Optional
import json
import tempfile
import os
import logging

from db import crud, schemas
from ..dependencies import get_db, get_selected_workcell_name, get_selected_workcell_id

router = APIRouter()


@router.get("", response_model=list[schemas.Form])
def get_forms(db: Session = Depends(get_db), workcell_name: Optional[str] = None) -> t.Any:
    """Get all forms, optionally filtered by workcell."""
    # If no workcell_name provided, use the selected workcell
    print("Received workcell_name:", workcell_name)
    if workcell_name is None:
        workcell_name = get_selected_workcell_name(db)
        print("Using selected workcell_name:", workcell_name)
    if workcell_name is None:
        return crud.form.get_all(db)   
    print("Workcell Name:", workcell_name)
    workcell = crud.workcell.get_by(db, obj_in={"name": workcell_name})
    if not workcell:
        raise HTTPException(status_code=404, detail="Workcell not found")
    return crud.form.get_all_by(db, obj_in={"workcell_id": workcell.id})


@router.get("/export-all")
def export_all_forms(db: Session = Depends(get_db)) -> t.Any:
    """Export all forms as a single downloadable JSON file."""
    # Get all forms from the database
    forms = crud.form.get_all(db)
    
    if not forms:
        raise HTTPException(status_code=404, detail="No forms found to export")
    
    # Create a temporary file for the JSON content
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as temp_file:
        temp_file_path = temp_file.name
        
        # Serialize all forms to JSON
        forms_json = {
            "forms": jsonable_encoder(forms),
            "export_metadata": {
                "export_date": datetime.now().isoformat(),
                "total_forms": len(forms),
                "version": "1.0"
            }
        }
        
        temp_file.write(json.dumps(forms_json, indent=2).encode("utf-8"))
    
    # Set the filename for download with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"all_forms_export_{timestamp}.json"
    
    # Return the file response which will trigger download in the browser
    return FileResponse(
        path=temp_file_path,
        filename=filename,
        media_type="application/json",
        background=BackgroundTask(
            lambda: os.unlink(temp_file_path)
        ),
    )


@router.get("/{form_name}", response_model=schemas.Form)
def get_form(form_name: str, db: Session = Depends(get_db)) -> t.Any:
    """Get a specific form by name, filtered by selected workcell."""
    # If it's numeric, treat as ID
    if form_name.isdigit():
        form = crud.form.get(db, id=int(form_name))
    else:
        # It's a name, filter by selected workcell
        selected_workcell_id = get_selected_workcell_id(db)
        form = crud.form.get_by(db, obj_in={"name": form_name, "workcell_id": selected_workcell_id})
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


@router.post("", response_model=schemas.Form)
def create_form(form: schemas.FormCreate, db: Session = Depends(get_db)) -> t.Any:
    """Create a new form."""
    # If no workcell_id provided, use the selected workcell
    if not hasattr(form, 'workcell_id') or form.workcell_id is None:
        form.workcell_id = get_selected_workcell_id(db)
    
    # Check if form with same name already exists in the same workcell
    existing_form = crud.form.get_by(db, obj_in={"name": form.name, "workcell_id": form.workcell_id})
    if existing_form:
        raise HTTPException(
            status_code=400, 
            detail=f"Form with name '{form.name}' already exists in this workcell"
        )
    
    return crud.form.create(db, obj_in=form)


@router.put("/{form_id}", response_model=schemas.Form)
def update_form(
    form_id: int, form_update: schemas.FormUpdate, db: Session = Depends(get_db)
) -> t.Any:
    """Update an existing form."""
    form = crud.form.get(db, id=form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Check if name is being updated and if it conflicts with existing forms
    if form_update.name and form_update.name != form.name:
        existing_form = crud.form.get_by(db, obj_in={"name": form_update.name})
        if existing_form:
            raise HTTPException(
                status_code=400, 
                detail=f"Form with name '{form_update.name}' already exists"
            )
    
    return crud.form.update(db, db_obj=form, obj_in=form_update)


@router.delete("/{form_id}", response_model=schemas.Form)
def delete_form(form_id: int, db: Session = Depends(get_db)) -> t.Any:
    """Delete a form."""
    form = crud.form.get(db, id=form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    return crud.form.remove(db, id=form_id)


@router.get("/{form_id}/export")
def export_form_config(form_id: int, db: Session = Depends(get_db)) -> t.Any:
    """Export a form configuration as a downloadable JSON file."""
    form = crud.form.get(db, id=form_id)
    if form is None:
        raise HTTPException(status_code=404, detail="Form not found")

    # Create a temporary file for the JSON content
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as temp_file:
        temp_file_path = temp_file.name
        # Serialize the form to JSON and write to the file
        form_json = jsonable_encoder(form)
        temp_file.write(json.dumps(form_json, indent=2).encode("utf-8"))

    # Set the filename for download
    filename = f"{form.name.replace(' ', '_')}-form.json"

    # Return the file response which will trigger download in the browser
    return FileResponse(
        path=temp_file_path,
        filename=filename,
        media_type="application/json",
        background=BackgroundTask(
            lambda: os.unlink(temp_file_path)
        ),
    )


@router.post("/import", response_model=schemas.Form)
async def import_form_config(
    file: UploadFile = File(...), db: Session = Depends(get_db)
) -> t.Any:
    """Import a form configuration from an uploaded JSON file."""
    try:
        # Read the uploaded file content
        file_content = await file.read()

        # Parse the JSON content
        try:
            form_data = json.loads(file_content.decode("utf-8"))
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400, detail="Invalid JSON format in uploaded file"
            )

        # Check if basic required fields are present
        if not isinstance(form_data, dict) or "name" not in form_data:
            raise HTTPException(
                status_code=400,
                detail="Invalid form configuration: Missing name field",
            )

        # Check if a form with this name already exists
        existing_form = crud.form.get_by(
            db, obj_in={"name": form_data["name"]}
        )

        # Extract form fields
        form_fields = {
            "name": form_data["name"],
            "description": form_data.get("description", ""),
            "fields": form_data.get("fields", []),
            "background_color": form_data.get("background_color"),
            "background_image": form_data.get("background_image"),
            "size": form_data.get("size", "medium"),
            "is_locked": form_data.get("is_locked", False),
        }

        # Create or update the form
        if existing_form:
            # Update existing form
            form = crud.form.update(
                db,
                db_obj=existing_form,
                obj_in=schemas.FormUpdate(**form_fields),
            )
        else:
            # Create new form
            form = crud.form.create(
                db, obj_in=schemas.FormCreate(**form_fields)
            )

        # Commit all changes
        db.commit()
        return form

    except Exception as e:
        db.rollback()
        logging.error(f"Error importing form configuration: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to import form configuration: {str(e)}"
        )