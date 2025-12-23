import logging
import typing as t
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

import db.models.inventory_models as models
from db import crud, schemas

from ..dependencies import get_db, get_selected_workcell_id, get_selected_workcell_name

router = APIRouter()


@router.get("", response_model=list[schemas.Script])
def get_scripts(
    db: Session = Depends(get_db), workcell_name: Optional[str] = None
) -> t.Any:
    # If no workcell_name provided, use the selected workcell
    if workcell_name is None:
        workcell_name = get_selected_workcell_name(db)

    workcell = crud.workcell.get_by(db, obj_in={"name": workcell_name})
    if not workcell:
        raise HTTPException(status_code=404, detail="Workcell not found")
    return crud.scripts.get_all_by(db, obj_in={"workcell_id": workcell.id})


@router.get("/{script_id}", response_model=schemas.Script)
def get_script(script_id: t.Union[int, str], db: Session = Depends(get_db)) -> t.Any:
    script = crud.scripts.get(db, id=script_id, normalize_name=False)
    if script is None:
        raise HTTPException(status_code=404, detail="Script not found")
    return script


@router.post("", response_model=schemas.Script)
def create_script(script: schemas.ScriptCreate, db: Session = Depends(get_db)) -> t.Any:
    # If no workcell_id provided, use the selected workcell
    if not hasattr(script, "workcell_id") or script.workcell_id is None:
        script.workcell_id = get_selected_workcell_id(db)

    # Check for existing script with same name in the same workcell
    existing_script = crud.scripts.get_by(
        db, obj_in={"name": script.name, "workcell_id": script.workcell_id}
    )
    if existing_script:
        raise HTTPException(
            status_code=400,
            detail=f"Script with name '{script.name}' already exists in this workcell",
        )

    return crud.scripts.create(db, obj_in=script)


@router.put("/{script_id}", response_model=schemas.ScriptCreate)
def update_script(
    script_id: int, script_update: schemas.ScriptUpdate, db: Session = Depends(get_db)
) -> t.Any:
    script = db.query(models.Script).filter(models.Script.id == script_id).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    return crud.scripts.update(db, db_obj=script, obj_in=script_update)


@router.delete("/{script_id}", response_model=schemas.Script)
def delete_script(script_id: int, db: Session = Depends(get_db)) -> t.Any:
    script = crud.scripts.get(db, id=script_id)
    if script is None:
        raise HTTPException(status_code=404, detail="Script not found")
    deleted_script = crud.scripts.remove(db, id=script_id)
    return deleted_script


@router.get("/{script_id}/export", response_model=schemas.Script)
def export_script_config(script_id: int, db: Session = Depends(get_db)) -> t.Any:
    """Export a script configuration."""
    script = crud.scripts.get(db, id=script_id)
    if script is None:
        raise HTTPException(status_code=404, detail="Script not found")
    return script


@router.post("/import", response_model=schemas.Script)
async def import_script_config(
    file: UploadFile = File(...),
    folder_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
) -> t.Any:
    """Import a script from an uploaded file."""
    try:
        # Get the currently selected workcell ID
        workcell_id = get_selected_workcell_id(db)

        # Read the uploaded file content
        file_content_bytes = await file.read()
        file_content = file_content_bytes.decode("utf-8")
        file_name = file.filename

        if not file_name:
            raise HTTPException(status_code=400, detail="File name is required")

        # Determine language from file extension
        if file_name.endswith(".py"):
            language = "python"
        elif file_name.endswith(".js"):
            language = "javascript"
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Only .py and .js files are allowed.",
            )

        # Extract script name from filename (remove extension)
        script_name = file_name.replace(".py", "").replace(".js", "")

        # Prepare script data for creation
        script_data = schemas.ScriptCreate(
            name=script_name,
            content=file_content,
            language=language,
            folder_id=folder_id,
            description="Imported script",
            workcell_id=workcell_id,
        )

        # Check if script with the same name exists
        existing_script = crud.scripts.get_by(
            db,
            obj_in={
                "name": script_data.name,
                "folder_id": script_data.folder_id,
                "workcell_id": workcell_id,
            },
        )

        if existing_script:
            raise HTTPException(
                status_code=400,
                detail=f"Script with name '{script_data.name}' already exists in this workcell/folder",
            )

        # Create new script
        new_script = crud.scripts.create(db, obj_in=script_data)
        db.commit()
        db.refresh(new_script)
        return new_script

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error importing script: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to import script: {str(e)}"
        )
