import typing as t
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import crud as crud
import models.inventory_models as models
from models.log_models import LogType, Log
import schemas as schemas
from models.db_session import SessionLocal,LogsSessionLocal, Base, LogBase
import logging 
from typing import Optional
import uvicorn
from contextlib import asynccontextmanager

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

log_config = uvicorn.config.LOGGING_CONFIG
log_config["formatters"]["access"]["fmt"] = "%(asctime)s | %(levelname)s | %(message)s"
log_config["formatters"]["default"]["fmt"] = "%(asctime)s | %(levelname)s | %(message)s"

@asynccontextmanager
async def lifespan(app: FastAPI):

    logging.info("Starting up db session")
    try:
        Base.metadata.create_all(bind=SessionLocal().get_bind())
        LogBase.metadata.create_all(bind=LogsSessionLocal().get_bind())
    except Exception as e:
        logging.error(e)
        raise e
    yield


app = FastAPI(title="Inventory API", lifespan=lifespan)
origins = ["http://localhost:3010", "http://127.0.0.1:3010"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db() -> t.Generator[Session, None, None]:
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

def log_db() -> t.Generator[Session, None, None]:
    db_session = LogsSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()



    # Shutdown tasks here
    print("Shutting down...")

@app.get("/inventory", response_model=schemas.Inventory)
def get_inventory(workcell_name: str, db: Session = Depends(get_db)) -> t.Any:
    workcell = crud.workcell.get_by(db=db, obj_in={"name": workcell_name})
    if not workcell:
        raise HTTPException(status_code=404, detail="Workcell not found")
    instruments = crud.instrument.get_all_by(db=db, obj_in={"workcell_id": workcell.id})
    nests = crud.nest.get_all_by_workcell_id(db=db, workcell_id=workcell.id)

    all_plates = crud.plate.get_all(db)
    plates = [
        plate
        for plate in all_plates
        if (plate.nest_id is None) or (plate.nest.instrument.workcell_id == workcell.id)
    ]
    wells = crud.well.get_all_by_workcell_id(db, workcell_id=workcell.id)
    reagents = crud.reagent.get_all_by_workcell_id(db, workcell_id=workcell.id)
    return {
        "workcell": workcell,
        "instruments": instruments,
        "nests": nests,
        "plates": plates,
        "wells": wells,
        "reagents": reagents,
    }


# CRUD API endpoints for Workcells
@app.get("/workcells", response_model=list[schemas.Workcell])
def get_workcells(db: Session = Depends(get_db)) -> t.Any:
    return crud.workcell.get_all(db)


@app.get("/workcells/{workcell_id}", response_model=schemas.Workcell)
def get_workcell(workcell_id: int, db: Session = Depends(get_db)) -> t.Any:
    workcell = crud.workcell.get(db, id=workcell_id)
    if workcell is None:
        raise HTTPException(status_code=404, detail="Workcell not found")
    return workcell


@app.post("/workcells", response_model=schemas.Workcell)
def create_workcell(
    workcell: schemas.WorkcellCreate, db: Session = Depends(get_db)
) -> t.Any:
    return crud.workcell.create(db, obj_in=workcell)


@app.put("/workcells/{workcell_id}", response_model=schemas.Workcell)
def update_workcell(
    workcell_id: int,
    workcell_update: schemas.WorkcellUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    workcell = crud.workcell.get(db, id=workcell_id)
    if workcell is None:
        raise HTTPException(status_code=404, detail="Workcell not found")
    return crud.workcell.update(db, db_obj=workcell, obj_in=workcell_update)


@app.delete("/workcells/{workcell_id}", response_model=schemas.Workcell)
def delete_workcell(workcell_id: int, db: Session = Depends(get_db)) -> t.Any:
    workcell = crud.workcell.get(db, id=workcell_id)
    if workcell is None:
        raise HTTPException(status_code=404, detail="Workcell not found")
    return crud.workcell.remove(db, id=workcell_id)


# CRUD API endpoints for Instruments
@app.get("/instruments", response_model=list[schemas.Instrument])
def get_instruments(
    db: Session = Depends(get_db), workcell_name: Optional[str] = None
) -> t.Any:
    if workcell_name:
        workcell = crud.workcell.get_by(db=db, obj_in={"name": workcell_name})
        if not workcell:
            raise HTTPException(status_code=404, detail="Workcell not found")
        return crud.instrument.get_all_by(db=db, obj_in={"workcell_id": workcell.id})
    else:
        return crud.instrument.get_all(db)


@app.get("/instruments/{instrument_id}", response_model=schemas.Instrument)
def get_instrument(instrument_id: int, db: Session = Depends(get_db)) -> t.Any:
    instrument = crud.instrument.get(db=db, id=instrument_id)
    if instrument is None:
        raise HTTPException(status_code=404, detail="Instrument not found")
    return instrument


@app.post("/instruments", response_model=schemas.Instrument)
def create_instrument(
    instrument: schemas.InstrumentCreate, db: Session = Depends(get_db)
) -> t.Any:
    return crud.instrument.create(db, obj_in=instrument)


@app.put("/instruments/{instrument_id}", response_model=schemas.Instrument)
def update_instrument(
    instrument_id: int,
    instrument_update: schemas.InstrumentUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    instrument = crud.instrument.get(db, id=instrument_id)
    if instrument is None:
        raise HTTPException(status_code=404, detail="Instrument not found")
    return crud.instrument.update(db, db_obj=instrument, obj_in=instrument_update)


@app.delete("/instruments/{instrument_id}", response_model=schemas.Instrument)
def delete_instrument(instrument_id: int, db: Session = Depends(get_db)) -> t.Any:
    instrument = crud.instrument.get(db, id=instrument_id)
    if instrument is None:
        raise HTTPException(status_code=404, detail="Instrument not found")
    return crud.instrument.remove(db, id=instrument_id)


# CRUD API endpoints for Nests
@app.get("/nests", response_model=list[schemas.Nest])
def get_nests(db: Session = Depends(get_db), workcell_name: Optional[str] = None) -> t.Any:
    if workcell_name:
        workcell = crud.workcell.get_by(db=db, obj_in={"name": workcell_name})
        if not workcell:
            raise HTTPException(status_code=404, detail="Workcell not found")
        return crud.nest.get_all_by_workcell_id(db=db, workcell_id=workcell.id)
    else:
        return crud.nest.get_all(db)


@app.get("/nests/{nest_id}", response_model=schemas.Nest)
def get_nest(nest_id: int, db: Session = Depends(get_db)) -> t.Any:
    nest = crud.nest.get(db, id=nest_id)
    if nest is None:
        raise HTTPException(status_code=404, detail="Nest not found")
    return nest


@app.post("/nests", response_model=schemas.Nest)
def create_nest(nest: schemas.NestCreate, db: Session = Depends(get_db)) -> t.Any:
    return crud.nest.create(db, obj_in=nest)


@app.put("/nests/{nest_id}", response_model=schemas.Nest)
def update_nest(
    nest_id: int, nest_update: schemas.NestUpdate, db: Session = Depends(get_db)
) -> t.Any:
    nest = crud.nest.get(db, id=nest_id)
    if nest is None:
        raise HTTPException(status_code=404, detail="Nest not found")
    return crud.nest.update(db, db_obj=nest, obj_in=nest_update)


@app.delete("/nests/{nest_id}", response_model=schemas.Nest)
def delete_nest(nest_id: int, db: Session = Depends(get_db)) -> t.Any:
    nest = crud.nest.get(db, id=nest_id)
    if nest is None:
        raise HTTPException(status_code=404, detail="Nest not found")
    return crud.nest.remove(db, id=nest_id)


# CRUD API endpoints for Plates
@app.get("/plates", response_model=list[schemas.Plate])
def get_plates(
    db: Session = Depends(get_db), workcell_name: Optional[str] = None
) -> t.Any:
    all_plates = crud.plate.get_all(db)
    if workcell_name:
        workcell = crud.workcell.get_by(db=db, obj_in={"name": workcell_name})
        if not workcell:
            raise HTTPException(status_code=404, detail="Workcell not found")
        return [
            plate
            for plate in all_plates
            if (plate.nest_id is None)
            or (plate.nest.instrument.workcell_id == workcell.id)
        ]
    return all_plates

@app.get("/plates/{plate_id}", response_model=schemas.Plate)
def get_plate(plate_id: int, db: Session = Depends(get_db)) -> t.Any:
    plate = crud.plate.get(db, id=plate_id)
    if plate is None:
        raise HTTPException(status_code=404, detail="Plate not found")
    return plate

@app.get("/plates/{plate_id}/info", response_model=schemas.PlateInfo)
def get_plate_info(plate_id: int, db: Session = Depends(get_db)) -> t.Any:
    plate = crud.plate.get(db, id=plate_id)
    if plate is None:
        raise HTTPException(status_code=404, detail="Plate not found")
    nest = crud.nest.get(db, id=plate.nest_id)
    wells = crud.well.get_all_by(db, obj_in={"plate_id": plate.id})
    return schemas.PlateInfo(
        id=plate.id,
        name=plate.name,
        plate_type=plate.plate_type,
        barcode=plate.barcode,
        nest_id=plate.nest_id,
        nest=schemas.Nest.from_orm(nest) if nest else None,
        wells=[schemas.Well.from_orm(well) for well in wells],
    )


# TODO: Switch rows and columns so that it iterates through columns first
@app.post("/plates", response_model=schemas.Plate)
def create_plate(plate: schemas.PlateCreate, db: Session = Depends(get_db)) -> t.Any:
    existing_plate = crud.plate.get_by(db, obj_in={"name": plate.name})
    if existing_plate:
        raise HTTPException(
            status_code=400, detail="Plate with that name already exists"
        )
    new_plate = crud.plate.create(db, obj_in=plate)
    # Depending on plate type, automatically create wells for plate
    # Use case switch statement
    columns =[]
    rows =[]
    plate_type = new_plate.plate_type
    if plate_type ==  "6 well":
        columns = [1, 2, 3]
        rows = ["A", "B"]
    elif plate_type == "6 well with organoid inserts":
        columns = [1, 2, 3]
        rows = ["A", "B"]
    elif plate_type ==  "12 well":
        columns = [1, 2, 3, 4]
        rows = ["A", "B", "C"]
    elif plate_type == "24 well":
        columns = [1, 2, 3, 4, 5, 6]
        rows = ["A", "B", "C", "D"]
    elif plate_type ==  "96 well":
        columns = list(range(1, 13))
        rows = ["A", "B", "C", "D", "E", "F", "G", "H"]
    elif plate_type == "384 well":
        columns = list(range(1,25))
        rows =  ["A", "B", "C", "D", "E", "F", "G", "H","I","J","K","L","M","N","O","P"]
    else:
        pass
    
    for column in columns:
        for row in rows:
            crud.well.create(
                        db, 
                        obj_in=schemas.WellCreate(
                            plate_id=new_plate.id, row=row,column=column
                        ),
                )
    return new_plate

@app.put("/plates/{plate_id}", response_model=schemas.Plate)
def update_plate(
    plate_id: int, plate_update: schemas.PlateUpdate, db: Session = Depends(get_db)
) -> t.Any:
    plate = crud.plate.get(db, id=plate_id)
    if plate is None:
        raise HTTPException(status_code=404, detail="Plate not found")
    return crud.plate.update(db, db_obj=plate, obj_in=plate_update)


@app.delete("/plates/{plate_id}", response_model=schemas.Plate)
def delete_plate(plate_id: int, db: Session = Depends(get_db)) -> t.Any:
    plate = crud.plate.get(db, id=plate_id)
    if plate is None:
        raise HTTPException(status_code=404, detail="Plate not found")
    return crud.plate.remove(db, id=plate_id)


# CRUD API endpoints for Wells
@app.get("/wells", response_model=list[schemas.Well])
def get_wells(
    db: Session = Depends(get_db),
    plate_id: Optional[int] = None,
    workcell_name: Optional[str] = None,
) -> t.Any:
    if workcell_name:
        workcell = crud.workcell.get_by(db=db, obj_in={"name": workcell_name})
        if not workcell:
            raise HTTPException(status_code=404, detail="Workcell not found")
        return crud.well.get_all_by_workcell_id(db, workcell_id=workcell.id)
    if plate_id:
        plate = crud.plate.get(db, id=plate_id)
        if plate is None:
            raise HTTPException(status_code=404, detail="Plate not found")
        return plate.wells
    return crud.well.get_all(db)


@app.get("/wells/{well_id}", response_model=schemas.Well)
def get_well(well_id: int, db: Session = Depends(get_db)) -> t.Any:
    well = crud.well.get(db, id=well_id)
    if well is None:
        raise HTTPException(status_code=404, detail="Well not found")
    return well


@app.post("/wells", response_model=schemas.Well)
def create_well(well: schemas.WellCreate, db: Session = Depends(get_db)) -> t.Any:
    return crud.well.create(db, obj_in=well)


@app.put("/wells/{well_id}", response_model=schemas.Well)
def update_well(
    well_id: int, well_update: schemas.WellUpdate, db: Session = Depends(get_db)
) -> t.Any:
    well = crud.well.get(db, id=well_id)
    if well is None:
        raise HTTPException(status_code=404, detail="Well not found")
    return crud.well.update(db, db_obj=well, obj_in=well_update)


@app.delete("/wells/{well_id}", response_model=schemas.Well)
def delete_well(well_id: int, db: Session = Depends(get_db)) -> t.Any:
    well = crud.well.get(db, id=well_id)
    if well is None:
        raise HTTPException(status_code=404, detail="Well not found")
    return crud.well.remove(db, id=well_id)


# CRUD API endpoints for Reagents
@app.get("/reagents", response_model=list[schemas.Reagent])
def get_reagents(
    db: Session = Depends(get_db),
    plate_id: Optional[int] = None,
    workcell_name: Optional[str] = None,
) -> t.Any:
    if workcell_name:
        workcell = crud.workcell.get_by(db=db, obj_in={"name": workcell_name})
        if not workcell:
            raise HTTPException(status_code=404, detail="Workcell not found")
        return crud.reagent.get_all_by_workcell_id(db, workcell_id=workcell.id)
    if plate_id:
        plate = crud.plate.get(db, id=plate_id)
        if plate is None:
            raise HTTPException(status_code=404, detail="Plate not found")
        reagents: list[models.Reagent] = []
        for well in plate.wells:
            reagents += well.reagents
        return reagents
    return crud.reagent.get_all(db)


@app.get("/reagents/{reagent_id}", response_model=schemas.Reagent)
def get_reagent(reagent_id: int, db: Session = Depends(get_db)) -> t.Any:
    reagent = crud.reagent.get(db, id=reagent_id)
    if reagent is None:
        raise HTTPException(status_code=404, detail="Reagent not found")
    return reagent


@app.post("/reagents", response_model=schemas.Reagent)
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


@app.put("/reagents/{reagent_id}", response_model=schemas.Reagent)
def update_reagent(
    reagent_id: int,
    reagent_update: schemas.ReagentUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    reagent = crud.reagent.get(db, id=reagent_id)
    if reagent is None:
        raise HTTPException(status_code=404, detail="Reagent not found")
    return crud.reagent.update(db, db_obj=reagent, obj_in=reagent_update)


@app.delete("/reagents/{reagent_id}", response_model=schemas.Reagent)
def delete_reagent(reagent_id: int, db: Session = Depends(get_db)) -> t.Any:
    reagent = crud.reagent.get(db, id=reagent_id)
    if reagent is None:
        raise HTTPException(status_code=404, detail="Reagent not found")
    return crud.reagent.remove(db, id=reagent_id)


@app.get("/nests/next_available/{instrument_id}", response_model=schemas.Nest)
def get_next_available_nest(instrument_id: int, db: Session = Depends(get_db)) -> t.Any:
    instrument = crud.instrument.get(db=db, id=instrument_id)
    if not instrument:
        raise HTTPException(status_code=404, detail="Instrument not found")
    nests = sorted(
        instrument.nests,
        key=lambda nest: (nest.row, nest.column),
    )
    for nest in nests:
        if nest.plate:
            continue
        else:
            return nest
    raise HTTPException(status_code=204, detail="No available nests")

@app.get("/log_types", response_model=list[schemas.LogType])
def get_log_types(db: Session = Depends(log_db)) -> t.Any:
    return crud.log_type.get_all(db)


@app.get("/logs",response_model=list[schemas.Log])
async def get_logs(db: Session = Depends(log_db)) -> t.Any:
    return crud.logs.get_all(db)

@app.get("/logs_paginated",response_model=list[schemas.LogPaginated])
async def get_logs_paginated(offset:int, limit:int, log_type:Optional[str] = None, db: Session = Depends(log_db)) -> t.Any:
    base_query = db.query(Log.id, Log.tool, Log.value, LogType.name.label("log_type"), Log.created_at).join(LogType, Log.log_type_id == LogType.id)
    if log_type:
        base_query = base_query.filter(LogType.name == log_type.upper())
    logs = base_query.order_by(Log.id.desc()).offset(offset).limit(limit).all()
    return logs

@app.get("/variables", response_model=list[schemas.Variable])
def get_variables(db: Session = Depends(get_db)) -> t.Any:
   return crud.variables.get_all(db)    

@app.get("/variables/{variable_name}", response_model=schemas.Variable)
def get_variable(variable_name:str, db: Session = Depends(get_db)) -> t.Any:
    existing_variable = db.query(models.Variable).filter(models.Variable.name == variable_name).first()
    if not existing_variable:
        raise HTTPException(status_code=404, detail="Variable not found")
    return existing_variable

@app.post("/variables", response_model=schemas.VariableCreate)
def create_variable(variable: schemas.VariableCreate, db: Session = Depends(get_db)) -> t.Any:
    logging.info(f"Creating variable {variable.name}")
    logging.info(f"Pay load is {variable}")
    existing_variable = db.query(models.Variable).filter(models.Variable.name == variable.name).first()
    if existing_variable:
        raise HTTPException(status_code=400, detail="Variable with that name already exists")
    db_variable = models.Variable(
        name=variable.name,
        value=variable.value,
        type=variable.type
    )
    db.add(db_variable)
    db.commit()
    db.refresh(db_variable)
    return db_variable

@app.put("/variables/{variable_id}", response_model=schemas.VariableUpdate)
def update_variable(variable_id: int, variable_update: schemas.VariableUpdate, db: Session = Depends(get_db)) -> t.Any:
    db_variable = db.query(models.Variable).filter(models.Variable.id == variable_id).first()
    if not db_variable:
        raise HTTPException(status_code=404, detail="Variable not found")
    return crud.variables.update(db, db_obj=db_variable, obj_in=variable_update)

@app.delete("/variables/{variable_id}", response_model=schemas.VariableCreate)
def delete_variable(variable_id: int, db: Session = Depends(get_db)) -> t.Any:
    db_variable = crud.variables.remove(db, id=variable_id)
    if not db_variable:
        raise HTTPException(status_code=404, detail="Variable not found")
    return db_variable
