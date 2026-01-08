# api/endpoints/nests.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import typing as t
from typing import Optional
from db import crud, schemas
from db.utils.inventory_utils import (
    create_default_inventory_nests,
    recreate_inventory_nests,
)
from ..dependencies import get_db, get_selected_workcell_name

router = APIRouter()


@router.get("", response_model=list[schemas.Nest])
def get_nests(
    db: Session = Depends(get_db), workcell_name: Optional[str] = None
) -> t.Any:
    if workcell_name is None:
        workcell_name = get_selected_workcell_name(db)
    workcell = crud.workcell.get_by(db=db, obj_in={"name": workcell_name})
    if not workcell:
        raise HTTPException(status_code=404, detail="Workcell not found")
    nests = crud.nest.get_all_nests_by_workcell_id(db=db, workcell_id=workcell.id)
    return nests


@router.get("/{nest_id}", response_model=schemas.Nest)
def get_nest(nest_id: int, db: Session = Depends(get_db)) -> t.Any:
    nest = crud.nest.get(db, id=nest_id)
    if nest is None:
        raise HTTPException(status_code=404, detail="Nest not found")
    return nest


@router.post("", response_model=schemas.Nest)
def create_nest(nest: schemas.NestCreate, db: Session = Depends(get_db)) -> t.Any:
    return crud.nest.create(db, obj_in=nest)


@router.put("/{nest_id}", response_model=schemas.Nest)
def update_nest(
    nest_id: int, nest_update: schemas.NestUpdate, db: Session = Depends(get_db)
) -> t.Any:
    nest = crud.nest.get(db, id=nest_id)
    if nest is None:
        raise HTTPException(status_code=404, detail="Nest not found")
    return crud.nest.update(db, db_obj=nest, obj_in=nest_update)


@router.delete("/{nest_id}", response_model=schemas.Nest)
def delete_nest(nest_id: int, db: Session = Depends(get_db)) -> t.Any:
    nest = crud.nest.get(db, id=nest_id)
    if nest is None:
        raise HTTPException(status_code=404, detail="Nest not found")
    return crud.nest.remove(db, id=nest_id)


@router.get("/next_available/{tool_id}", response_model=schemas.Nest)
def get_next_available_nest(tool_id: int, db: Session = Depends(get_db)) -> t.Any:
    tool = crud.tool.get(db=db, id=tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    nests = sorted(
        tool.nests,
        key=lambda nest: (nest.row, nest.column),
    )
    for nest in nests:
        if nest.plate:
            continue
        else:
            return nest
    raise HTTPException(status_code=204, detail="No available nests")


@router.post("/initialize/{tool_id}", response_model=list[schemas.Nest])
def initialize_tool_inventory(
    tool_id: int, force: bool = False, db: Session = Depends(get_db)
) -> t.Any:
    """
    Initialize or recreate inventory nests for a tool.

    Args:
        tool_id: ID of the tool
        force: If True, delete existing nests and recreate them
    """
    try:
        if force:
            nests = recreate_inventory_nests(db, tool_id, force=True)
        else:
            nests = create_default_inventory_nests(db, tool_id)
        return nests
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to initialize inventory: {str(e)}"
        )
