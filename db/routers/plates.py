from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import typing as t
from typing import Optional

from db import crud, schemas
import db.models.inventory_models as models
from ..dependencies import get_db, get_selected_workcell_name

router = APIRouter()


@router.get("", response_model=list[schemas.Plate])
def get_plates(
    db: Session = Depends(get_db), workcell_name: Optional[str] = None
) -> t.Any:
    """Get all plates, optionally filtered by workcell."""
    # If no workcell_name provided or empty, use the selected workcell
    if not workcell_name:
        workcell_name = get_selected_workcell_name(db)
        
    workcell = crud.workcell.get_by(db=db, obj_in={"name": workcell_name})
    if not workcell:
        raise HTTPException(status_code=404, detail="Workcell not found")

    # Get all nests for this workcell (both in tools and hotels)
    nests = crud.nest.get_all_nests_by_workcell_id(db=db, workcell_id=workcell.id)
    nest_ids = [nest.id for nest in nests]

    # Find plates in these nests
    workcell_plates = (
        db.query(models.Plate).filter(models.Plate.nest_id.in_(nest_ids)).all()
    )

    # Also include plates not in any nest
    unassigned_plates = (
        db.query(models.Plate).filter(models.Plate.nest_id.is_(None)).all()
    )

    return workcell_plates + unassigned_plates


@router.get("/{plate_id}", response_model=schemas.Plate)
def get_plate(plate_id: int, db: Session = Depends(get_db)) -> t.Any:
    plate = crud.plate.get(db, id=plate_id)
    if plate is None:
        raise HTTPException(status_code=404, detail="Plate not found")
    return plate


@router.get("/{plate_id}/info", response_model=schemas.PlateInfo)
def get_plate_info(plate_id: int, db: Session = Depends(get_db)) -> t.Any:
    plate = crud.plate.get(db, id=plate_id)
    if plate is None:
        raise HTTPException(status_code=404, detail="Plate not found")

    # Only get nest if nest_id is not None
    nest = None
    if plate.nest_id is not None:
        nest = crud.nest.get(db, id=plate.nest_id)

    wells = crud.well.get_all_by(db, obj_in={"plate_id": plate.id})
    return schemas.PlateInfo(
        id=plate.id,
        name=plate.name,
        plate_type=plate.plate_type,
        barcode=plate.barcode,
        nest_id=plate.nest_id,
        nest=schemas.Nest.model_validate(nest) if nest else None,
        wells=[schemas.Well.model_validate(well) for well in wells],
        created_at=plate.created_at,
        updated_at=plate.updated_at,
    )


@router.post("", response_model=schemas.Plate)
def create_plate(plate: schemas.PlateCreate, db: Session = Depends(get_db)) -> t.Any:
    existing_plate = crud.plate.get_by(db, obj_in={"name": plate.name})
    if existing_plate:
        raise HTTPException(
            status_code=400, detail="Plate with that name already exists"
        )
    new_plate = crud.plate.create(db, obj_in=plate)

    # If the plate is assigned to a nest, update the nest status to occupied
    if new_plate.nest_id is not None:
        nest = crud.nest.get(db, id=new_plate.nest_id)
        if nest:
            nest.status = schemas.NestStatus.occupied
            db.commit()

            # Create plate nest history record
            history = models.PlateNestHistory(
                plate_id=new_plate.id,
                nest_id=nest.id,
                action=models.PlateNestAction.check_in,
            )
            db.add(history)
            db.commit()

    # Depending on plate type, automatically create wells for plate
    columns = []
    rows = []
    plate_type = new_plate.plate_type
    if plate_type == "6 well":
        columns = [1, 2, 3]
        rows = ["A", "B"]
    elif plate_type == "6 well with organoid inserts":
        columns = [1, 2, 3]
        rows = ["A", "B"]
    elif plate_type == "12 well":
        columns = [1, 2, 3, 4]
        rows = ["A", "B", "C"]
    elif plate_type == "24 well":
        columns = [1, 2, 3, 4, 5, 6]
        rows = ["A", "B", "C", "D"]
    elif plate_type == "96 well":
        columns = list(range(1, 13))
        rows = ["A", "B", "C", "D", "E", "F", "G", "H"]
    elif plate_type == "384 well":
        columns = list(range(1, 25))
        rows = [
            "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P",
        ]

    for column in columns:
        for row in rows:
            crud.well.create(
                db,
                obj_in=schemas.WellCreate(
                    plate_id=new_plate.id, row=row, column=column
                ),
            )
    return new_plate


@router.put("/{plate_id}", response_model=schemas.Plate)
def update_plate(
    plate_id: int, plate_update: schemas.PlateUpdate, db: Session = Depends(get_db)
) -> t.Any:
    plate = crud.plate.get(db, id=plate_id)
    if plate is None:
        raise HTTPException(status_code=404, detail="Plate not found")

    # Check if this is a checkout operation (nest_id being set to None)
    is_checkout = plate.nest_id is not None and plate_update.nest_id is None

    # Check if this is a check-in operation (nest_id being set from None to a value)
    is_checkin = plate.nest_id is None and plate_update.nest_id is not None

    # If this is a checkout, use the specialized method
    if is_checkout:
        try:
            return crud.nest.check_out_plate(db, plate_id=plate_id)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    # If this is a check-in, ensure the nest is available and update statuses
    if is_checkin:
        try:
            # First check if the nest is available
            if plate_update.nest_id is not None:
                nest = crud.nest.get(db, id=plate_update.nest_id)
                if not nest:
                    raise ValueError("Nest not found")
                if nest.status != schemas.NestStatus.empty:
                    raise ValueError("Nest is already occupied")

                # Update plate status to stored for check-in
                plate_update.status = schemas.PlateStatus.stored

                # Update nest status to occupied
                nest.status = schemas.NestStatus.occupied

                # Record history
                history = models.PlateNestHistory(
                    plate_id=plate.id,
                    nest_id=nest.id,
                    action=models.PlateNestAction.check_in,
                )
                db.add(history)
            else:
                raise ValueError("Nest ID cannot be None for check-in operation")

            # Perform the update using the base update method
            updated_plate = crud.plate.update(db, db_obj=plate, obj_in=plate_update)

            # Commit the transaction to save nest status change and history
            db.commit()

            return updated_plate
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    # Regular update for non-checkout operations
    return crud.plate.update(db, db_obj=plate, obj_in=plate_update)


@router.delete("/{plate_id}", response_model=schemas.Plate)
def delete_plate(plate_id: int, db: Session = Depends(get_db)) -> t.Any:
    plate = crud.plate.get(db, id=plate_id)
    if plate is None:
        raise HTTPException(status_code=404, detail="Plate not found")
    return crud.plate.remove(db, id=plate_id)