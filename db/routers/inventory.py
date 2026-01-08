from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import typing as t

from db import crud, schemas
from ..dependencies import get_db

router = APIRouter()


@router.get("/inventory", response_model=schemas.Inventory)
def get_inventory(workcell_name: str, db: Session = Depends(get_db)) -> t.Any:
    # Get workcell by name
    workcell = crud.workcell.get_by(db, obj_in={"name": workcell_name})
    if workcell is None:
        raise HTTPException(status_code=404, detail="Workcell not found")

    # Get all tools for the workcell
    tools = crud.tool.get_all_by(db, obj_in={"workcell_id": workcell.id})

    # Get all hotels for the workcell
    hotels = crud.hotel.get_all_by(db, obj_in={"workcell_id": workcell.id})

    # Get all nests for the tools in the workcell
    nests = []
    for tool in tools:
        nests.extend(crud.nest.get_all_by(db, obj_in={"tool_id": tool.id}))

    # Get all nests for the hotels in the workcell
    for hotel in hotels:
        nests.extend(crud.nest.get_all_by(db, obj_in={"hotel_id": hotel.id}))

    # Get all plates in nests
    plates = []
    for nest in nests:
        if nest.status == schemas.NestStatus.occupied:
            plate = crud.plate.get_by(db, obj_in={"nest_id": nest.id})
            if plate:
                plates.append(plate)

    # Get all wells for all plates
    wells = []
    for plate in plates:
        wells.extend(crud.well.get_all_by(db, obj_in={"plate_id": plate.id}))

    # Get all reagents for all wells
    reagents = []
    for well in wells:
        reagents.extend(crud.reagent.get_all_by(db, obj_in={"well_id": well.id}))

    return schemas.Inventory(
        workcell=workcell,
        instruments=[tool for tool in tools],
        hotels=[hotel for hotel in hotels],
        nests=[nest for nest in nests],
        plates=[plate for plate in plates],
        wells=[well for well in wells],
        reagents=[reagent for reagent in reagents],
    )
