# api/routers/hotels.py

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import typing as t
from typing import Optional

from db import crud, schemas
from ..dependencies import get_db, get_selected_workcell_name

router = APIRouter()


@router.get("", response_model=list[schemas.Hotel])
def get_hotels(
    db: Session = Depends(get_db), workcell_name: Optional[str] = None
) -> t.Any:
    # If no workcell_name provided, use the selected workcell
    if workcell_name is None:
        workcell_name = get_selected_workcell_name(db)

    workcell = crud.workcell.get_by(db, obj_in={"name": workcell_name})
    if not workcell:
        raise HTTPException(status_code=404, detail="Workcell not found")
    return crud.hotel.get_all_by(db, obj_in={"workcell_id": workcell.id})


@router.get("/{hotel_id}", response_model=schemas.Hotel)
def get_hotel(hotel_id: int, db: Session = Depends(get_db)) -> t.Any:
    hotel = crud.hotel.get(db, id=hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel


@router.post("", response_model=schemas.Hotel)
def create_hotel(hotel: schemas.HotelCreate, db: Session = Depends(get_db)) -> t.Any:
    return crud.hotel.create(db, obj_in=hotel)


@router.put("/{hotel_id}", response_model=schemas.Hotel)
def update_hotel(
    hotel_id: int, hotel_update: schemas.HotelUpdate, db: Session = Depends(get_db)
) -> t.Any:
    hotel = crud.hotel.get(db, id=hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return crud.hotel.update(db, db_obj=hotel, obj_in=hotel_update)


@router.delete("/{hotel_id}", response_model=schemas.Hotel)
def delete_hotel(hotel_id: int, db: Session = Depends(get_db)) -> t.Any:
    hotel = crud.hotel.get(db, id=hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return crud.hotel.remove(db, id=hotel_id)
