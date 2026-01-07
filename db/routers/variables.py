from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import typing as t
from typing import Optional

from db import crud, schemas
import db.models.inventory_models as models
from ..dependencies import get_db, get_selected_workcell_name, get_selected_workcell_id

router = APIRouter()


@router.get("", response_model=list[schemas.Variable])
def get_variables(
    db: Session = Depends(get_db), workcell_name: Optional[str] = None
) -> t.Any:
    # If no workcell_name provided, use the selected workcell
    if workcell_name is None:
        workcell_name = get_selected_workcell_name(db)

    workcell = crud.workcell.get_by(db, obj_in={"name": workcell_name})
    if not workcell:
        raise HTTPException(status_code=404, detail="Workcell not found")
    return crud.variables.get_all_by(db, obj_in={"workcell_id": workcell.id})


@router.get("/{variable_name}", response_model=schemas.Variable)
def get_variable(
    variable_name: t.Union[int, str], db: Session = Depends(get_db)
) -> t.Any:
    # If it's a numeric ID, get by ID directly
    if isinstance(variable_name, str) and variable_name.isdigit():
        existing_variable = crud.variables.get(db, id=int(variable_name))
    elif isinstance(variable_name, int):
        existing_variable = crud.variables.get(db, id=variable_name)
    else:
        # It's a name, so we need to filter by selected workcell
        selected_workcell_id = get_selected_workcell_id(db)
        existing_variable = crud.variables.get_by(
            db, obj_in={"name": variable_name, "workcell_id": selected_workcell_id}
        )

    if not existing_variable:
        raise HTTPException(status_code=404, detail="Variable not found")
    return existing_variable


@router.post("", response_model=schemas.Variable)
def create_variable(
    variable: schemas.VariableCreate, db: Session = Depends(get_db)
) -> t.Any:
    # If no workcell_id provided, use the selected workcell
    if not hasattr(variable, "workcell_id") or variable.workcell_id is None:
        variable.workcell_id = get_selected_workcell_id(db)

    existing_variable = (
        db.query(models.Variable)
        .filter(
            models.Variable.name == variable.name,
            models.Variable.workcell_id == variable.workcell_id,
        )
        .first()
    )
    if existing_variable:
        raise HTTPException(
            status_code=400,
            detail="Variable with that name already exists in this workcell",
        )
    return crud.variables.create(db, obj_in=variable)


@router.put("/{variable_name}", response_model=schemas.VariableUpdate)
def update_variable(
    variable_name: t.Union[int, str],
    variable_update: schemas.VariableUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    db_variable = crud.variables.get(db, id=variable_name)
    if not db_variable:
        raise HTTPException(status_code=404, detail="Variable not found")
    return crud.variables.update(db, db_obj=db_variable, obj_in=variable_update)


@router.delete("/{variable_id}", response_model=schemas.VariableCreate)
def delete_variable(variable_id: int, db: Session = Depends(get_db)) -> t.Any:
    db_variable = crud.variables.remove(db, id=variable_id)
    if not db_variable:
        raise HTTPException(status_code=404, detail="Variable not found")
    return db_variable
