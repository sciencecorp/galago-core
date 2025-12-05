from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import typing as t
from typing import Optional

from db import crud, schemas
import db.models.inventory_models as models
from ..dependencies import get_db, get_selected_workcell_name

router = APIRouter()


@router.get("", response_model=list[schemas.Reagent])
def get_reagents(
    db: Session = Depends(get_db),
    plate_id: Optional[int] = None,
    workcell_name: Optional[str] = None,
) -> t.Any:
    if plate_id:
        plate = crud.plate.get(db, id=plate_id)
        if plate is None:
            raise HTTPException(status_code=404, detail="Plate not found")
        reagents: list[models.Reagent] = []
        for well in plate.wells:
            reagents += well.reagents
        return reagents
    
    # If no workcell_name provided or empty, use the selected workcell
    if not workcell_name:
        workcell_name = get_selected_workcell_name(db)
        
    workcell = crud.workcell.get_by(db=db, obj_in={"name": workcell_name})
    if not workcell:
        raise HTTPException(status_code=404, detail="Workcell not found")
    return crud.reagent.get_all_by_workcell_id(db, workcell_id=workcell.id)


@router.get("/{reagent_id}", response_model=schemas.Reagent)
def get_reagent(reagent_id: int, db: Session = Depends(get_db)) -> t.Any:
    reagent = crud.reagent.get(db, id=reagent_id)
    if reagent is None:
        raise HTTPException(status_code=404, detail="Reagent not found")
    return reagent


@router.post("", response_model=schemas.Reagent)
def create_reagent(
    reagent: schemas.ReagentCreate, db: Session = Depends(get_db)
) -> t.Any:
    existing_reagent = crud.reagent.get_by(
        db, obj_in={"well_id": reagent.well_id, "name": reagent.name}
    )
    if existing_reagent:
        return crud.reagent.update(
            db,
            db_obj=existing_reagent,
            obj_in=schemas.ReagentUpdate(
                name=reagent.name,
                expiration_date=reagent.expiration_date,
                volume=reagent.volume + float(existing_reagent.volume),
                well_id=reagent.well_id,
            ),
        )
    return crud.reagent.create(db, obj_in=reagent)


@router.put("/{reagent_id}", response_model=schemas.Reagent)
def update_reagent(
    reagent_id: int,
    reagent_update: schemas.ReagentUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    reagent = crud.reagent.get(db, id=reagent_id)
    if reagent is None:
        raise HTTPException(status_code=404, detail="Reagent not found")
    return crud.reagent.update(db, db_obj=reagent, obj_in=reagent_update)


@router.delete("/{reagent_id}", response_model=schemas.Reagent)
def delete_reagent(reagent_id: int, db: Session = Depends(get_db)) -> t.Any:
    reagent = crud.reagent.get(db, id=reagent_id)
    if reagent is None:
        raise HTTPException(status_code=404, detail="Reagent not found")
    return crud.reagent.remove(db, id=reagent_id)