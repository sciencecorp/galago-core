import typing as t
from fastapi import FastAPI, HTTPException, Depends, Request, APIRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import crud as crud
import models.inventory_models as models
import schemas as schemas
from models.db_session import SessionLocal,LogsSessionLocal, Base, LogBase
import logging 
from typing import Optional, Dict, Any
import uvicorn
from contextlib import asynccontextmanager
from models.inventory_models import protocol_commands, Protocol

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

log_config = uvicorn.config.LOGGING_CONFIG
log_config["formatters"]["access"]["fmt"] = "%(asctime)s | %(levelname)s | %(message)s"
log_config["formatters"]["default"]["fmt"] = "%(asctime)s | %(levelname)s | %(message)s"


@asynccontextmanager
async def lifespan(app: FastAPI)-> t.AsyncGenerator[None, None]:
    try:
        Base.metadata.create_all(bind=SessionLocal().get_bind())
        LogBase.metadata.create_all(bind=LogsSessionLocal().get_bind())
    except Exception as e:
        logging.error(e)
        raise e
    yield


app = FastAPI(title="Inventory API", lifespan=lifespan, root_path="/api")
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

@app.exception_handler(IntegrityError)
async def integrity_error_handler(request:Request, exc:IntegrityError) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={"message": "Integrity error", "detail": str(exc.orig)}
    )

@app.get("/inventory", response_model=schemas.Inventory)
def get_inventory(workcell_name: str, db: Session = Depends(get_db)) -> t.Any:
    workcell = crud.workcell.get_by(db=db, obj_in={"name": workcell_name})
    if not workcell:
        raise HTTPException(status_code=404, detail="Workcell not found")
    tools = crud.tool.get_all_by(db=db, obj_in={"workcell_id": workcell.id})
    nests = crud.nest.get_all_by_workcell_id(db=db, workcell_id=workcell.id)

    all_plates = crud.plate.get_all(db)
    plates = [
        plate
        for plate in all_plates
        if (plate.nest_id is None) or (plate.nest.tool.workcell_id == workcell.id)
    ]
    wells = crud.well.get_all_by_workcell_id(db, workcell_id=workcell.id)
    reagents = crud.reagent.get_all_by_workcell_id(db, workcell_id=workcell.id)
    return {
        "workcell": workcell,
        "tools": tools,
        "nests": nests,
        "plates": plates,
        "wells": wells,
        "reagents": reagents,
    }

@app.get("/test")
def test():
    return {"test": "test hello"}
    
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

@app.get("/tools", response_model=list[schemas.Tool])
def get_tools(db: Session = Depends(get_db)) -> t.Any:
    return crud.tool.get_all(db)

@app.get("/tools/{tool_id}", response_model=schemas.Tool)
def get_tool(tool_id: str, db: Session = Depends(get_db)) -> t.Any:
    tool = crud.tool.get(db, id=tool_id)
    if tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool

@app.post("/tools", response_model=schemas.Tool)
def create_tool(tool: schemas.ToolCreate, db: Session = Depends(get_db)) -> t.Any:
    all_tools = crud.tool.get_all(db)
    existing_ports = [tool.port for tool in all_tools]
    port_range = range(4000, 4050) #let's cap the number of tools at 50 for now, i've never seen a workcell this big anyways.
    
    def get_next_available_port(session: Session) -> int:
        for port in port_range:
            if port not in existing_ports:
                return port
        raise ValueError("No available ports in the range 4000-4050")
    tool.port = get_next_available_port(db)
    return crud.tool.create(db, obj_in=tool)

@app.put("/tools/{tool_id}", response_model=schemas.Tool)
def update_tool(tool_id: str, tool_update: schemas.ToolUpdate, db: Session = Depends(get_db)) -> t.Any:
    tool = crud.tool.get(db, id=tool_id)
    if tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")
    return crud.tool.update(db, db_obj=tool, obj_in=tool_update)

@app.delete("/tools/{tool_id}", response_model=schemas.Tool)
def delete_tool(tool_id: int, db: Session = Depends(get_db)) -> t.Any:
    tool = crud.tool.get(db, id=tool_id)
    if tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")
    return crud.tool.remove(db, id=tool_id)

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
            or (plate.nest.tool.workcell_id == workcell.id)
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


@app.get("/nests/next_available/{tool_id}", response_model=schemas.Nest)
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


@app.get("/logs", response_model=list[schemas.Log])
async def get_logs(
    db: Session = Depends(log_db),
    skip: int = 0,
    limit: int = 100,
    order_by: Optional[str] = None,
    descending: bool = False,
    filters: Optional[Dict[str, Any]] = None,
) -> t.Any:
    return crud.logs.paginate(
        db,
        skip=skip,
        limit=limit,
        order_by=order_by,
        descending=descending,
        filters=filters,
    )

@app.post("/logs", response_model=schemas.Log)
async def create_log(log: schemas.LogCreate, db: Session = Depends(log_db)) -> t.Any:
    return crud.logs.create(db, obj_in=log)

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
    existing_variable = db.query(models.Variable).filter(models.Variable.name == variable.name).first()
    if existing_variable:
        raise HTTPException(status_code=400, detail="Variable with that name already exists")
    return crud.variables.create(db, obj_in=variable)

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

@app.get("/labware", response_model=list[schemas.Labware])
def get_labwares(db: Session = Depends(get_db)) -> t.Any:
    return crud.labware.get_all(db)


@app.get("/labware/{labware_id}", response_model=schemas.Labware)
def get_labware(labware_id: int, db: Session = Depends(get_db)) -> t.Any:
    labware = crud.labware.get(db, id=labware_id)
    if labware is None:
        raise HTTPException(status_code=404, detail="Labware not found")
    return labware

@app.post("/labware", response_model=schemas.Labware)
def create_labware(labware: schemas.LabwareCreate, db: Session = Depends(get_db)) -> t.Any:
    return crud.labware.create(db, obj_in=labware)

@app.put("/labware/{labware_id}", response_model=schemas.LabwareUpdate)
def update_labware(labware_id: int, labware_update: schemas.LabwareUpdate, db: Session = Depends(get_db)) -> t.Any:
    labware = db.query(models.Labware).filter(models.Labware.id == labware_id).first()
    if not labware:
        raise HTTPException(status_code=404, detail="Labware not found")
    return crud.labware.update(db, db_obj=labware, obj_in=labware_update)

@app.delete("/labware/{labware_id}", response_model=schemas.LabwareCreate)
def delete_labware(labware_id: int, db: Session = Depends(get_db)) -> t.Any:
    return crud.labware.remove(db, id=labware_id)   

@app.get("/protocols", response_model=list[schemas.Protocol])
def get_protocols(workcell: str = None, db: Session = Depends(get_db)) -> t.Any:
    if workcell:
        return crud.protocol.get_all_by(db=db, obj_in={"workcell": workcell})
    return crud.protocol.get_all(db)

@app.get("/protocols/{protocol_id}", response_model=schemas.Protocol)
def get_protocol(protocol_id: str, db: Session = Depends(get_db)) -> t.Any:
    protocol = crud.protocol.get(db, id=protocol_id)
    if protocol is None:
        raise HTTPException(status_code=404, detail="Protocol not found")
    return protocol

@app.post("/protocols", response_model=schemas.Protocol)
def create_protocol(protocol: schemas.ProtocolCreate, db: Session = Depends(get_db)) -> t.Any:
    return crud.protocol.create(db, obj_in=protocol)

@app.put("/protocols/{protocol_id}", response_model=schemas.Protocol)
def update_protocol(
    protocol_id: str,
    protocol_update: schemas.ProtocolUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    protocol = crud.protocol.get(db, id=protocol_id)
    if protocol is None:
        raise HTTPException(status_code=404, detail="Protocol not found")
    return crud.protocol.update(db, db_obj=protocol, obj_in=protocol_update)

@app.delete("/protocols/{protocol_id}", response_model=schemas.Protocol)
def delete_protocol(protocol_id: str, db: Session = Depends(get_db)) -> t.Any:
    protocol = crud.protocol.get(db, id=protocol_id)
    if protocol is None:
        raise HTTPException(status_code=404, detail="Protocol not found")
    return crud.protocol.remove(db, id=protocol_id)

@app.get("/settings", response_model=list[schemas.AppSettings])
def get_settings(db: Session = Depends(get_db)) -> t.Any:
    return crud.settings.get_all(db)

@app.get("/settings/{name}", response_model=schemas.AppSettings)
def get_settings(name:str, db: Session = Depends(get_db)) -> t.Any:
    setting = crud.settings.get_by(db, obj_in={"name": name})
    if setting is None:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting

@app.post("/settings", response_model=schemas.AppSettingsCreate)
def create_setting(setting: schemas.AppSettingsCreate, db: Session = Depends(get_db)) -> t.Any:
    return crud.settings.create(db, obj_in=setting)

@app.put("/settings/{name}", response_model=schemas.AppSettingsUpdate)
def update_setting(name: str, setting_update: schemas.AppSettingsUpdate, db: Session = Depends(get_db)) -> t.Any:
    settings = db.query(models.AppSettings).filter(models.AppSettings.name == name).first()
    if not settings:
        settings = crud.settings.create(db, obj_in=schemas.AppSettingsCreate(name=name, value=setting_update.value,is_active=True))
    return crud.variables.update(db, db_obj=settings, obj_in=setting_update)

@app.get("/scripts", response_model=list[schemas.Script])
def get_scripts(db: Session = Depends(get_db)) -> t.Any:
    return crud.scripts.get_all(db)

@app.get("/scripts/{script_id}", response_model=schemas.Script)
def get_script(script_id: int, db: Session = Depends(get_db)) -> t.Any:
    script = crud.scripts.get(db, id=script_id)
    if script is None:
        raise HTTPException(status_code=404, detail="Script not found")
    return script

@app.post("/scripts", response_model=schemas.ScriptCreate)
def create_script(script: schemas.ScriptCreate, db: Session = Depends(get_db)) -> t.Any:
    return crud.scripts.create(db, obj_in=script)

@app.put("/scripts/{script_id}", response_model=schemas.ScriptCreate)
def update_script(script_id: int, script_update: schemas.ScriptUpdate, db: Session = Depends(get_db)) -> t.Any:
    script = db.query(models.Script).filter(models.Script.id == script_id).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    return crud.scripts.update(db, db_obj=script, obj_in=script_update)

@app.delete("/scripts/{script_id}", response_model=schemas.Script)
def delete_script(script_id:int, db: Session = Depends(get_db)) -> t.Any:
    return crud.scripts.remove(db, id=script_id)
