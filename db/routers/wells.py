from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import typing as t
from typing import Optional

from db import crud, schemas
from ..dependencies import get_db, get_selected_workcell_name

router = APIRouter()


@router.get("", response_model=list[schemas.Well])
def get_wells(
    db: Session = Depends(get_db),
    plate_id: Optional[int] = None,
    workcell_name: Optional[str] = None,
) -> t.Any:
    if plate_id:
        plate = crud.plate.get(db, id=plate_id)
        if plate is None:
            raise HTTPException(status_code=404, detail="Plate not found")
        return plate.wells
    
    # If no workcell_name provided, use the selected workcell
    if workcell_name is None:
        workcell_name = get_selected_workcell_name(db)
        
    workcell = crud.workcell.get_by(db=db, obj_in={"name": workcell_name})
    if not workcell:
        raise HTTPException(status_code=404, detail="Workcell not found")
    return crud.well.get_all_by_workcell_id(db, workcell_id=workcell.id)


@router.get("/{well_id}", response_model=schemas.Well)
def get_well(well_id: int, db: Session = Depends(get_db)) -> t.Any:
    well = crud.well.get(db, id=well_id)
    if well is None:
        raise HTTPException(status_code=404, detail="Well not found")
    return well


@router.post("", response_model=schemas.Well)
def create_well(well: schemas.WellCreate, db: Session = Depends(get_db)) -> t.Any:
    return crud.well.create(db, obj_in=well)


@router.put("/{well_id}", response_model=schemas.Well)
def update_well(
    well_id: int, well_update: schemas.WellUpdate, db: Session = Depends(get_db)
) -> t.Any:
    well = crud.well.get(db, id=well_id)
    if well is None:
        raise HTTPException(status_code=404, detail="Well not found")
    return crud.well.update(db, db_obj=well, obj_in=well_update)


@router.delete("/{well_id}", response_model=schemas.Well)
def delete_well(well_id: int, db: Session = Depends(get_db)) -> t.Any:
    well = crud.well.get(db, id=well_id)
    if well is None:
        raise HTTPException(status_code=404, detail="Well not found")
    return crud.well.remove(db, id=well_id)