# api/endpoints/tools.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import typing as t
from typing import Optional
from db import crud, schemas
import db.models.inventory_models as models
from db.initializers import (
    create_default_motion_profile,
    create_default_grip_params,
)
from db.utils.inventory_utils import create_default_inventory_nests
from ..dependencies import get_db, get_selected_workcell_name
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("", response_model=list[schemas.Tool])
def get_tools(db: Session = Depends(get_db), workcell_name: Optional[str] = None) -> t.Any:
    if not workcell_name:
        workcell_name = get_selected_workcell_name(db)
    workcell = crud.workcell.get_by(db, obj_in={"name": workcell_name})
    if not workcell:
        raise HTTPException(status_code=404, detail="Workcell not found")
    return crud.tool.get_all_by(db, obj_in={"workcell_id": workcell.id})


@router.get("/{tool_id}", response_model=schemas.Tool)
def get_tool(tool_id: t.Union[int, str], db: Session = Depends(get_db)) -> t.Any:
    tool = crud.tool.get(db, tool_id, True)
    if tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool


@router.post("", response_model=schemas.Tool)
def create_tool(tool: schemas.ToolCreate, db: Session = Depends(get_db)) -> t.Any:
    all_tools = crud.tool.get_all(db)
    existing_ports = [tool.port for tool in all_tools]
    port_range = range(40000, 40100)

    def get_next_available_port(session: Session) -> int:
        for port in port_range:
            if port not in existing_ports:
                return port
        raise ValueError("No available ports in the range 40000-40100")

    tool.port = get_next_available_port(db)
    created_tool = crud.tool.create(db, obj_in=tool)

    # Create default motion profile and grip params if it's a pf400
    if created_tool.type == "pf400":
        create_default_motion_profile(db, created_tool.id)
        create_default_grip_params(db, created_tool.id)
        logger.info(f"Created default profiles for new PF400 tool: {created_tool.name}")

    # Create default inventory nests if tool type is in the map
    try:
        nests = create_default_inventory_nests(db, created_tool.id)
        if nests:
            logger.info(f"Created {len(nests)} inventory nests for tool: {created_tool.name}")
    except Exception as e:
        logger.error(f"Failed to create inventory nests for tool {created_tool.name}: {e}")
        # Don't fail the entire operation if nest creation fails

    return created_tool


@router.put("/{tool_id}", response_model=schemas.Tool)
def update_tool(
    tool_id: str, tool_update: schemas.ToolUpdate, db: Session = Depends(get_db)
) -> t.Any:
    tool = (
        db.query(models.Tool)
        .filter(func.lower(models.Tool.name) == tool_id.lower().replace("_", " "))
        .first()
    )
    if tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")
    return crud.tool.update(db, db_obj=tool, obj_in=tool_update)


@router.delete("/{tool_id}", response_model=schemas.Tool)
def delete_tool(tool_id: str, db: Session = Depends(get_db)) -> t.Any:
    tool = (
        db.query(models.Tool)
        .filter(func.lower(models.Tool.name) == tool_id.lower().replace("_", " "))
        .first()
    )
    if tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")
    return crud.tool.remove(db, id=tool.id)