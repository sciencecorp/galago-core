# api/routers/script_folders.py

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import typing as t
from typing import Optional

from db import crud, schemas
from ..dependencies import get_db, get_selected_workcell_name, get_selected_workcell_id

router = APIRouter()


@router.get("", response_model=list[schemas.ScriptFolderResponse])
def get_script_folders(
    db: Session = Depends(get_db), workcell_name: Optional[str] = None
) -> t.Any:
    # If no workcell_name provided, use the selected workcell
    if workcell_name is None:
        workcell_name = get_selected_workcell_name(db)

    workcell = crud.workcell.get_by(db, obj_in={"name": workcell_name})
    if not workcell:
        raise HTTPException(status_code=404, detail="Workcell not found")
    # Only return root folders (where parent_id is null) for the specific workcell
    return [
        folder
        for folder in crud.script_folders.get_all_by(
            db, obj_in={"workcell_id": workcell.id}
        )
        if folder.parent_id is None
    ]


@router.get("/{folder_id}", response_model=schemas.ScriptFolder)
def get_script_folder(folder_id: int, db: Session = Depends(get_db)) -> t.Any:
    folder = crud.script_folders.get(db, id=folder_id)
    if folder is None:
        raise HTTPException(status_code=404, detail="Script folder not found")
    return folder


@router.post("", response_model=schemas.ScriptFolderResponse)
def create_script_folder(
    folder: schemas.ScriptFolderCreate, db: Session = Depends(get_db)
) -> t.Any:
    # If no workcell_id provided, use the selected workcell
    if not hasattr(folder, "workcell_id") or folder.workcell_id is None:
        folder.workcell_id = get_selected_workcell_id(db)

    # Check for existing folder with same name in the same workcell
    existing_folder = crud.script_folders.get_by(
        db, obj_in={"name": folder.name, "workcell_id": folder.workcell_id}
    )
    if existing_folder:
        raise HTTPException(
            status_code=400,
            detail=f"Script folder with name '{folder.name}' already exists in this workcell",
        )

    return crud.script_folders.create(db, obj_in=folder)


@router.put("/{folder_id}", response_model=schemas.ScriptFolder)
def update_script_folder(
    folder_id: int,
    folder_update: schemas.ScriptFolderUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    folder = crud.script_folders.get(db, id=folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="Script folder not found")
    return crud.script_folders.update(db, db_obj=folder, obj_in=folder_update)


@router.delete("/{folder_id}", response_model=schemas.ScriptFolder)
def delete_script_folder(folder_id: int, db: Session = Depends(get_db)) -> t.Any:
    folder = crud.script_folders.get(db, id=folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="Script folder not found")
    if folder.scripts or folder.subfolders:
        raise HTTPException(status_code=400, detail="Cannot delete non-empty folder")
    return crud.script_folders.remove(db, id=folder_id)
