import typing as t
from fastapi import FastAPI, HTTPException, Depends, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from db import crud
import db.models.inventory_models as models
from db import schemas
from db.models.db_session import SessionLocal, LogsSessionLocal, Base, LogBase
import logging
from typing import Optional, Dict, Any, List
import uvicorn
from contextlib import asynccontextmanager
from db.waypoint_handler import handle_waypoint_upload
from pydantic import BaseModel
from db.initializers import (
    initialize_database,
    create_default_motion_profile,
    create_default_grip_params,
)
from sqlalchemy import func
from .models.inventory_models import Protocol
import json
from fastapi.encoders import jsonable_encoder
from starlette.background import BackgroundTask

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

log_config = uvicorn.config.LOGGING_CONFIG
log_config["formatters"]["access"]["fmt"] = "%(asctime)s | %(levelname)s | %(message)s"
log_config["formatters"]["default"]["fmt"] = "%(asctime)s | %(levelname)s | %(message)s"


@asynccontextmanager
async def lifespan(app: FastAPI) -> t.AsyncGenerator[None, None]:
    try:
        Base.metadata.create_all(bind=SessionLocal().get_bind())
        LogBase.metadata.create_all(bind=LogsSessionLocal().get_bind())

        # Initialize database with default data
        db = SessionLocal()
        try:
            initialize_database(db)
        finally:
            db.close()
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
    expose_headers=["*"],
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
async def integrity_error_handler(
    request: Request, exc: IntegrityError
) -> JSONResponse:
    return JSONResponse(
        status_code=400, content={"message": "Integrity error", "detail": str(exc.orig)}
    )


@app.get("/health")
def health_check() -> t.Dict[str, str]:
    return {"status": "ok"}


@app.get("/inventory", response_model=schemas.Inventory)
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
        tools=[tool for tool in tools],
        hotels=[hotel for hotel in hotels],
        nests=[nest for nest in nests],
        plates=[plate for plate in plates],
        wells=[well for well in wells],
        reagents=[reagent for reagent in reagents],
    )


@app.get("/test")
def test():
    return {"test": "test hello"}


# CRUD API endpoints for Workcells
@app.get("/workcells", response_model=list[schemas.Workcell])
def get_workcells(db: Session = Depends(get_db)) -> t.Any:
    workcells = crud.workcell.get_all(db)
    return [workcell for workcell in workcells]


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
    db_workcell = crud.workcell.create(db, obj_in=workcell)
    return db_workcell


@app.put("/workcells/{workcell_id}", response_model=schemas.Workcell)
def update_workcell(
    workcell_id: int,
    workcell_update: schemas.WorkcellUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    workcell = crud.workcell.get(db, id=workcell_id)
    if workcell is None:
        raise HTTPException(status_code=404, detail="Workcell not found")
    updated_workcell = crud.workcell.update(db, db_obj=workcell, obj_in=workcell_update)
    return updated_workcell


@app.delete("/workcells/{workcell_id}", response_model=schemas.Workcell)
def delete_workcell(workcell_id: int, db: Session = Depends(get_db)) -> t.Any:
    workcell = crud.workcell.get(db, id=workcell_id)
    if workcell is None:
        raise HTTPException(status_code=404, detail="Workcell not found")
    deleted_workcell = crud.workcell.remove(db, id=workcell_id)
    return deleted_workcell


@app.get("/workcells/{workcell_id}/export")
def export_workcell_config(workcell_id: int, db: Session = Depends(get_db)) -> t.Any:
    """Export a workcell configuration including all related tools as a downloadable JSON file."""
    from fastapi.responses import FileResponse
    import tempfile
    import os

    workcell = crud.workcell.get(db, id=workcell_id)
    if workcell is None:
        raise HTTPException(status_code=404, detail="Workcell not found")

    # Explicitly load tools and protocols
    _ = workcell.tools
    _ = workcell.protocols
    # Create a temporary file for the JSON content
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as temp_file:
        temp_file_path = temp_file.name
        # Serialize the workcell to JSON and write to the file
        workcell_json = jsonable_encoder(workcell)
        temp_file.write(json.dumps(workcell_json, indent=2).encode("utf-8"))

    # Set the filename for download
    filename = f"{workcell.name.replace(' ', '_')}-config.json"

    # Return the file response which will trigger download in the browser
    return FileResponse(
        path=temp_file_path,
        filename=filename,
        media_type="application/json",
        background=BackgroundTask(
            lambda: os.unlink(temp_file_path)
        ),  # Delete the temp file after response is sent
    )


@app.post("/workcells/import", response_model=schemas.Workcell)
async def import_workcell_config(
    file: UploadFile = File(...), db: Session = Depends(get_db)
) -> t.Any:
    """Import a workcell configuration from an uploaded JSON file.

    If a workcell with the same name already exists, it will update that workcell.
    Otherwise, it will create a new workcell.
    """
    try:
        # Read the uploaded file content
        file_content = await file.read()

        # Parse the JSON content
        try:
            workcell_data = json.loads(file_content.decode("utf-8"))
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400, detail="Invalid JSON format in uploaded file"
            )

        # Check if basic required fields are present
        if not isinstance(workcell_data, dict) or "name" not in workcell_data:
            raise HTTPException(
                status_code=400,
                detail="Invalid workcell configuration: Missing name field",
            )

        # Check if a workcell with this name already exists
        existing_workcell = crud.workcell.get_by(
            db, obj_in={"name": workcell_data["name"]}
        )

        # Extract workcell fields
        workcell_fields = {
            "name": workcell_data["name"],
            "description": workcell_data.get("description", ""),
            "location": workcell_data.get("location", ""),
        }

        # Create or update the workcell
        if existing_workcell:
            # Update existing workcell
            workcell = crud.workcell.update(
                db,
                db_obj=existing_workcell,
                obj_in=schemas.WorkcellUpdate(**workcell_fields),
            )
        else:
            # Create new workcell
            workcell = crud.workcell.create(
                db, obj_in=schemas.WorkcellCreate(**workcell_fields)
            )

        # Process and create/update tools if they exist in the import data
        if "tools" in workcell_data and isinstance(workcell_data["tools"], list):
            for tool_data in workcell_data["tools"]:
                # Skip if essential tool data is missing
                if (
                    not isinstance(tool_data, dict)
                    or "name" not in tool_data
                    or "type" not in tool_data
                ):
                    continue

                # Set the workcell_id for the tool
                tool_data["workcell_id"] = workcell.id

                # Check if this tool already exists in the workcell
                existing_tool = None
                for t in workcell.tools:
                    if t.name == tool_data["name"]:
                        existing_tool = t
                        break

                if existing_tool:
                    # Update existing tool
                    tool_update = {k: v for k, v in tool_data.items() if k != "id"}
                    crud.tool.update(
                        db,
                        db_obj=existing_tool,
                        obj_in=schemas.ToolUpdate(**tool_update),
                    )
                else:
                    # Create new tool
                    new_tool = crud.tool.create(
                        db, obj_in=schemas.ToolCreate(**tool_data)
                    )
                    # Create default motion profile and grip params if it's a pf400
                    if new_tool.type == "pf400":
                        create_default_motion_profile(db, new_tool.id)
                        create_default_grip_params(db, new_tool.id)
                        logging.info(
                            f"Created default profiles for imported PF400 tool: {new_tool.name}"
                        )

        # Process and create/update protocols if they exist in the import data
        if "protocols" in workcell_data and isinstance(
            workcell_data["protocols"], list
        ):
            # Ensure protocols relation is loaded if the workcell existed
            if existing_workcell:
                # Refresh to ensure relationships are loaded, needed if we are updating
                db.refresh(workcell)
                _ = workcell.protocols  # This ensures the collection is loaded

            # Query existing protocols for this workcell once to avoid N+1 queries
            current_protocols = (
                db.query(models.Protocol)
                .filter(models.Protocol.workcell_id == workcell.id)
                .all()
            )
            existing_protocol_map = {p.name: p for p in current_protocols}

            for protocol_data in workcell_data["protocols"]:
                # Basic validation (add more checks if needed)
                if not isinstance(protocol_data, dict) or "name" not in protocol_data:
                    logging.warning(
                        f"Skipping invalid protocol data (missing name): {protocol_data}"
                    )
                    continue

                # Remove fields not part of the model before checking existence/updating/creating
                protocol_data_cleaned = {
                    k: v
                    for k, v in protocol_data.items()
                    if hasattr(models.Protocol, k)
                    or k
                    in [
                        "name",
                        "category",
                        "workcell_id",
                        "description",
                        "icon",
                        "params",
                        "commands",
                        "version",
                        "is_active",
                    ]
                }
                protocol_data_cleaned[
                    "workcell_id"
                ] = workcell.id  # Ensure correct workcell id

                protocol_name = protocol_data_cleaned.get("name")
                if protocol_name:
                    existing_protocol = existing_protocol_map.get(protocol_name)

                    if existing_protocol:
                        # Update existing protocol
                        update_payload = {
                            k: v for k, v in protocol_data_cleaned.items() if k != "id"
                        }

                        try:
                            # Validate payload against update schema
                            protocol_update_schema = schemas.ProtocolUpdate(
                                **update_payload
                            )
                            update_data = protocol_update_schema.dict(
                                exclude_unset=True
                            )
                            for key, value in update_data.items():
                                if hasattr(existing_protocol, key):
                                    setattr(existing_protocol, key, value)
                            # db.flush() # Flush is optional here, commit will handle it
                        except Exception as e:
                            logging.warning(
                                f"Skipping protocol update for '{protocol_name}' due to error: {e}"
                            )
                            logging.exception(
                                "Detailed error during protocol update preparation:"
                            )
                            continue
                    else:
                        # Create new protocol
                        create_payload = protocol_data_cleaned.copy()

                        # Ensure required fields for creation are present
                        if "category" not in create_payload:
                            logging.warning(
                                f"Skipping protocol creation for '{protocol_name}' due to missing 'category'."
                            )
                            continue

                        try:
                            # Validate payload against create schema
                            protocol_create_schema = schemas.ProtocolCreate(
                                **create_payload
                            )
                            new_protocol = models.Protocol(
                                **protocol_create_schema.dict()
                            )
                            db.add(new_protocol)
                            db.flush()  # Flush to get potential ID and check constraints early
                        except Exception as e:
                            logging.warning(
                                f"Skipping protocol creation for '{protocol_name}' due to error: {e}"
                            )
                            logging.exception(
                                "Detailed error during protocol creation:"
                            )
                            continue
                else:
                    logging.warning(
                        f"Skipping protocol data because 'name' was missing or None: {protocol_data_cleaned}"
                    )

        # Commit all changes made within the try block (workcell, tools, protocols)
        db.commit()

        # Return the updated workcell (re-query ensures relations are fresh)
        return crud.workcell.get(db, id=workcell.id)

    except Exception as e:
        db.rollback()  # Rollback any changes if an error occurred
        # Log the error and provide a user-friendly message
        logging.error(f"Error importing workcell configuration: {str(e)}")
        # Log detailed exception for debugging
        logging.exception("Detailed error during import_workcell_config:")
        raise HTTPException(
            status_code=500, detail=f"Failed to import workcell configuration: {str(e)}"
        )


@app.get("/tools", response_model=list[schemas.Tool])
def get_tools(db: Session = Depends(get_db)) -> t.Any:
    return crud.tool.get_all(db)


@app.get("/tools/{tool_id}", response_model=schemas.Tool)
def get_tool(tool_id: t.Union[int, str], db: Session = Depends(get_db)) -> t.Any:
    # Get tool by lowercase name
    tool = crud.tool.get(db, tool_id, True)
    if tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool


@app.post("/tools", response_model=schemas.Tool)
def create_tool(tool: schemas.ToolCreate, db: Session = Depends(get_db)) -> t.Any:
    all_tools = crud.tool.get_all(db)
    existing_ports = [tool.port for tool in all_tools]
    port_range = range(4000, 4050)  # let's cap the number of tools at 50 for now

    def get_next_available_port(session: Session) -> int:
        for port in port_range:
            if port not in existing_ports:
                return port
        raise ValueError("No available ports in the range 4000-4050")

    tool.port = get_next_available_port(db)
    created_tool = crud.tool.create(db, obj_in=tool)

    # Create default motion profile and grip params if it's a pf400
    if created_tool.type == "pf400":
        create_default_motion_profile(db, created_tool.id)
        create_default_grip_params(db, created_tool.id)
        logging.info(
            f"Created default profiles for new PF400 tool: {created_tool.name}"
        )

    return created_tool


@app.put("/tools/{tool_id}", response_model=schemas.Tool)
def update_tool(
    tool_id: str, tool_update: schemas.ToolUpdate, db: Session = Depends(get_db)
) -> t.Any:
    tool = (
        db.query(models.Tool)
        .filter(func.lower(models.Tool.name) == tool_id.lower().replace("_", " "))
        .first()
    )
    # tool = crud.tool.get(db, id=tool_id)
    if tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")
    return crud.tool.update(db, db_obj=tool, obj_in=tool_update)


@app.delete("/tools/{tool_id}", response_model=schemas.Tool)
def delete_tool(tool_id: str, db: Session = Depends(get_db)) -> t.Any:
    tool = (
        db.query(models.Tool)
        .filter(func.lower(models.Tool.name) == tool_id.lower().replace("_", " "))
        .first()
    )
    if tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")
    return crud.tool.remove(db, id=tool.id)


# CRUD API endpoints for Nests
@app.get("/nests", response_model=list[schemas.Nest])
def get_nests(
    db: Session = Depends(get_db), workcell_name: Optional[str] = None
) -> t.Any:
    if workcell_name:
        workcell = crud.workcell.get_by(db=db, obj_in={"name": workcell_name})
        if not workcell:
            raise HTTPException(status_code=404, detail="Workcell not found")

        # Use the specialized method that gets both tool and hotel nests
        nests = crud.nest.get_all_nests_by_workcell_id(db=db, workcell_id=workcell.id)
        print(
            f"Retrieved {len(nests)} nests for workcell {workcell_name} (id: {workcell.id})"
        )
        return nests
    else:
        return crud.nest.get_all(db)


# upload teach pendant data through xml/json file #TODO @mohamed


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
            if (plate.nest_id is None) or (plate.nest.tool.workcell_id == workcell.id)
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
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J",
            "K",
            "L",
            "M",
            "N",
            "O",
            "P",
        ]
    else:
        pass

    for column in columns:
        for row in rows:
            crud.well.create(
                db,
                obj_in=schemas.WellCreate(
                    plate_id=new_plate.id, row=row, column=column
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
def get_variable(
    variable_name: t.Union[int, str], db: Session = Depends(get_db)
) -> t.Any:
    existing_variable = crud.variables.get(db, id=variable_name)
    if not existing_variable:
        raise HTTPException(status_code=404, detail="Variable not found")
    return existing_variable


@app.post("/variables", response_model=schemas.VariableCreate)
def create_variable(
    variable: schemas.VariableCreate, db: Session = Depends(get_db)
) -> t.Any:
    existing_variable = (
        db.query(models.Variable).filter(models.Variable.name == variable.name).first()
    )
    if existing_variable:
        raise HTTPException(
            status_code=400, detail="Variable with that name already exists"
        )
    return crud.variables.create(db, obj_in=variable)


@app.put("/variables/{variable_id}", response_model=schemas.VariableUpdate)
def update_variable(
    variable_id: int,
    variable_update: schemas.VariableUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    db_variable = (
        db.query(models.Variable).filter(models.Variable.id == variable_id).first()
    )
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
def create_labware(
    labware: schemas.LabwareCreate, db: Session = Depends(get_db)
) -> t.Any:
    return crud.labware.create(db, obj_in=labware)


@app.put("/labware/{labware_id}", response_model=schemas.LabwareUpdate)
def update_labware(
    labware_id: int,
    labware_update: schemas.LabwareUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    labware = db.query(models.Labware).filter(models.Labware.id == labware_id).first()
    if not labware:
        raise HTTPException(status_code=404, detail="Labware not found")
    return crud.labware.update(db, db_obj=labware, obj_in=labware_update)


@app.delete("/labware/{labware_id}", response_model=schemas.LabwareCreate)
def delete_labware(labware_id: int, db: Session = Depends(get_db)) -> t.Any:
    return crud.labware.remove(db, id=labware_id)


@app.get("/settings", response_model=list[schemas.AppSettings])
def get_settings(db: Session = Depends(get_db)) -> t.Any:
    return crud.settings.get_all(db)


@app.get("/settings/{name}", response_model=schemas.AppSettings)
def get_setting(name: str, db: Session = Depends(get_db)) -> t.Any:
    setting = crud.settings.get_by(db, obj_in={"name": name})
    if setting is None:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting


@app.post("/settings", response_model=schemas.AppSettingsCreate)
def create_setting(
    setting: schemas.AppSettingsCreate, db: Session = Depends(get_db)
) -> t.Any:
    return crud.settings.create(db, obj_in=setting)


@app.put("/settings/{name}", response_model=schemas.AppSettingsUpdate)
def update_setting(
    name: str, setting_update: schemas.AppSettingsUpdate, db: Session = Depends(get_db)
) -> t.Any:
    settings = (
        db.query(models.AppSettings).filter(models.AppSettings.name == name).first()
    )
    if not settings:
        settings = crud.settings.create(
            db,
            obj_in=schemas.AppSettingsCreate(
                name=name,
                # Provide default empty string if None
                value=setting_update.value or "",
                is_active=True,
            ),
        )
    return crud.settings.update(db, db_obj=settings, obj_in=setting_update)


@app.get("/script-folders", response_model=list[schemas.ScriptFolderResponse])
def get_script_folders(db: Session = Depends(get_db)) -> t.Any:
    # Only return root folders (where parent_id is null)
    return [
        folder for folder in crud.script_folders.get_all(db) if folder.parent_id is None
    ]


@app.get("/script-folders/{folder_id}", response_model=schemas.ScriptFolder)
def get_script_folder(folder_id: int, db: Session = Depends(get_db)) -> t.Any:
    folder = crud.script_folders.get(db, id=folder_id)
    if folder is None:
        raise HTTPException(status_code=404, detail="Script folder not found")
    return folder


@app.post("/script-folders", response_model=schemas.ScriptFolderResponse)
def create_script_folder(
    folder: schemas.ScriptFolderCreate, db: Session = Depends(get_db)
) -> t.Any:
    return crud.script_folders.create(db, obj_in=folder)


@app.put("/script-folders/{folder_id}", response_model=schemas.ScriptFolder)
def update_script_folder(
    folder_id: int,
    folder_update: schemas.ScriptFolderUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    folder = crud.script_folders.get(db, id=folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="Script folder not found")
    return crud.script_folders.update(db, db_obj=folder, obj_in=folder_update)


@app.delete("/script-folders/{folder_id}", response_model=schemas.ScriptFolder)
def delete_script_folder(folder_id: int, db: Session = Depends(get_db)) -> t.Any:
    folder = crud.script_folders.get(db, id=folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="Script folder not found")
    if folder.scripts or folder.subfolders:
        raise HTTPException(status_code=400, detail="Cannot delete non-empty folder")
    return crud.script_folders.remove(db, id=folder_id)


@app.get("/scripts", response_model=list[schemas.Script])
def get_scripts(db: Session = Depends(get_db)) -> t.Any:
    return crud.scripts.get_all(db)


@app.get("/scripts/{script_id}", response_model=schemas.Script)
def get_script(script_id: t.Union[int, str], db: Session = Depends(get_db)) -> t.Any:
    script = crud.scripts.get(db, id=script_id)
    if script is None:
        raise HTTPException(status_code=404, detail="Script not found")
    return script


@app.post("/scripts", response_model=schemas.ScriptCreate)
def create_script(script: schemas.ScriptCreate, db: Session = Depends(get_db)) -> t.Any:
    return crud.scripts.create(db, obj_in=script)


@app.put("/scripts/{script_id}", response_model=schemas.ScriptCreate)
def update_script(
    script_id: int, script_update: schemas.ScriptUpdate, db: Session = Depends(get_db)
) -> t.Any:
    script = db.query(models.Script).filter(models.Script.id == script_id).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    return crud.scripts.update(db, db_obj=script, obj_in=script_update)


@app.delete("/scripts/{script_id}", response_model=schemas.Script)
def delete_script(script_id: int, db: Session = Depends(get_db)) -> t.Any:
    script = crud.scripts.get(db, id=script_id)
    if script is None:
        raise HTTPException(status_code=404, detail="Script not found")
    deleted_script = crud.scripts.remove(db, id=script_id)
    return deleted_script


@app.get("/scripts/{script_id}/export", response_model=schemas.Script)
def export_script_config(script_id: int, db: Session = Depends(get_db)) -> t.Any:
    """Export a script configuration."""
    script = crud.scripts.get(db, id=script_id)
    if script is None:
        raise HTTPException(status_code=404, detail="Script not found")
    # The response model ensures the script object is returned
    return script


@app.post("/scripts/import", response_model=schemas.Script)
async def import_script_config(
    file: UploadFile = File(...),
    folder_id: Optional[int] = File(None),
    db: Session = Depends(get_db),
) -> t.Any:
    """Import a script from an uploaded file."""
    try:
        # Read the uploaded file content
        file_content_bytes = await file.read()
        file_content = file_content_bytes.decode("utf-8")
        file_name = file.filename
        if not file_name:
            raise HTTPException(status_code=400, detail="File name is required")
        if file_name.endswith(".py"):
            language = "python"
        elif file_name.endswith(".js"):
            language = "javascript"
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Only .py and .js files are allowed.",
            )
        # Prepare script data for creation
        script_data = schemas.ScriptCreate(
            name=file_name.replace(".py", "").replace(".js", ""),
            content=file_content,
            language=language,
            folder_id=folder_id,
            description="Imported script",  # Add a default description
        )

        # Check if script with the same name exists in the same folder (or globally if no folder)
        existing_script = crud.scripts.get_by(
            db, obj_in={"name": script_data.name, "folder_id": script_data.folder_id}
        )

        if existing_script:
            raise HTTPException(
                status_code=400,
                detail=f"Script with name '{script_data.name}' already exists",
            )
        else:
            # Create new script
            new_script = crud.scripts.create(db, obj_in=script_data)
            db.commit()
            db.refresh(new_script)
            return new_script

    except Exception as e:
        db.rollback()
        logging.error(f"Error importing script: {str(e)}")
        logging.exception("Detailed error during import_script_config:")
        raise HTTPException(
            status_code=500, detail=f"Failed to import script: {str(e)}"
        )


@app.get("/robot-arm-locations", response_model=list[schemas.RobotArmLocation])
def get_robot_arm_locations(
    db: Session = Depends(get_db), tool_id: Optional[t.Union[int, str]] = None
) -> t.Any:
    if tool_id:
        tool = crud.tool.get(db, tool_id, True)
        if not tool:
            raise HTTPException(status_code=404, detail="Tool not found")
        return crud.robot_arm_location.get_all_by(db, obj_in={"tool_id": int(tool.id)})

    return crud.robot_arm_location.get_all(db)


@app.post("/robot-arm-locations", response_model=schemas.RobotArmLocation)
def create_robot_arm_location(
    location: schemas.RobotArmLocationCreate, db: Session = Depends(get_db)
) -> t.Any:
    return crud.robot_arm_location.create(db, obj_in=location)


@app.put("/robot-arm-locations/{location_id}", response_model=schemas.RobotArmLocation)
def update_robot_arm_location(
    location_id: int,
    location: schemas.RobotArmLocationUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    db_location = crud.robot_arm_location.get(db, id=location_id)
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")
    return crud.robot_arm_location.update(db, db_obj=db_location, obj_in=location)


@app.delete(
    "/robot-arm-locations/{location_id}", response_model=schemas.RobotArmLocation
)
def delete_robot_arm_location(location_id: int, db: Session = Depends(get_db)) -> t.Any:
    # First check if this location is referenced as a safe location
    location = crud.robot_arm_location.get(db, id=location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return crud.robot_arm_location.remove(db, id=location_id)


# RobotArm Sequence endpoints
@app.get("/robot-arm-sequences", response_model=list[schemas.RobotArmSequence])
def get_robot_arm_sequences(
    db: Session = Depends(get_db), tool_id: Optional[int] = None
) -> t.Any:
    if tool_id:
        return crud.robot_arm_sequence.get_all_by(db, obj_in={"tool_id": tool_id})
    return crud.robot_arm_sequence.get_all(db)


@app.post("/robot-arm-sequences", response_model=schemas.RobotArmSequence)
def create_robot_arm_sequence(
    sequence: schemas.RobotArmSequenceCreate, db: Session = Depends(get_db)
) -> t.Any:
    return crud.robot_arm_sequence.create(db, obj_in=sequence)


@app.put("/robot-arm-sequences/{sequence_id}", response_model=schemas.RobotArmSequence)
def update_robot_arm_sequence(
    sequence_id: int,
    sequence: schemas.RobotArmSequenceUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    db_sequence = crud.robot_arm_sequence.get(db, id=sequence_id)
    if not db_sequence:
        raise HTTPException(status_code=404, detail="Sequence not found")
    return crud.robot_arm_sequence.update(db, db_obj=db_sequence, obj_in=sequence)


@app.delete(
    "/robot-arm-sequences/{sequence_id}", response_model=schemas.RobotArmSequence
)
def delete_robot_arm_sequence(sequence_id: int, db: Session = Depends(get_db)) -> t.Any:
    sequence = crud.robot_arm_sequence.get(db, id=sequence_id)
    if not sequence:
        raise HTTPException(status_code=404, detail="Sequence not found")
    return crud.robot_arm_sequence.remove(db, id=sequence_id)


# RobotArm Motion Profile endpoints
@app.get(
    "/robot-arm-motion-profiles", response_model=list[schemas.RobotArmMotionProfile]
)
def get_robot_arm_motion_profiles(
    db: Session = Depends(get_db), tool_id: Optional[int] = None
) -> t.Any:
    if tool_id:
        return crud.robot_arm_motion_profile.get_all_by(db, obj_in={"tool_id": tool_id})
    return crud.robot_arm_motion_profile.get_all(db)


@app.post("/robot-arm-motion-profiles", response_model=schemas.RobotArmMotionProfile)
def create_robot_arm_motion_profile(
    profile: schemas.RobotArmMotionProfileCreate, db: Session = Depends(get_db)
) -> t.Any:
    return crud.robot_arm_motion_profile.create(db, obj_in=profile)


@app.put(
    "/robot-arm-motion-profiles/{profile_id}",
    response_model=schemas.RobotArmMotionProfile,
)
def update_robot_arm_motion_profile(
    profile_id: int,
    profile: schemas.RobotArmMotionProfileUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    db_profile = crud.robot_arm_motion_profile.get(db, id=profile_id)
    if not db_profile:
        raise HTTPException(status_code=404, detail="Motion profile not found")
    return crud.robot_arm_motion_profile.update(db, db_obj=db_profile, obj_in=profile)


@app.delete(
    "/robot-arm-motion-profiles/{profile_id}",
    response_model=schemas.RobotArmMotionProfile,
)
def delete_robot_arm_motion_profile(
    profile_id: int, db: Session = Depends(get_db)
) -> t.Any:
    profile = crud.robot_arm_motion_profile.get(db, id=profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Motion profile not found")
    return crud.robot_arm_motion_profile.remove(db, id=profile_id)


# RobotArm Grip Parameters endpoints
@app.get("/robot-arm-grip-params", response_model=list[schemas.RobotArmGripParams])
def get_robot_arm_grip_params(
    db: Session = Depends(get_db), tool_id: Optional[int] = None
) -> t.Any:
    if tool_id:
        return crud.robot_arm_grip_params.get_all_by(db, obj_in={"tool_id": tool_id})
    return crud.robot_arm_grip_params.get_all(db)


@app.post("/robot-arm-grip-params", response_model=schemas.RobotArmGripParams)
def create_robot_arm_grip_params(
    params: schemas.RobotArmGripParamsCreate, db: Session = Depends(get_db)
) -> t.Any:
    return crud.robot_arm_grip_params.create(db, obj_in=params)


@app.put(
    "/robot-arm-grip-params/{params_id}", response_model=schemas.RobotArmGripParams
)
def update_robot_arm_grip_params(
    params_id: int,
    params: schemas.RobotArmGripParamsUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    db_params = crud.robot_arm_grip_params.get(db, id=params_id)
    if not db_params:
        raise HTTPException(status_code=404, detail="Grip parameters not found")
    return crud.robot_arm_grip_params.update(db, db_obj=db_params, obj_in=params)


@app.delete(
    "/robot-arm-grip-params/{params_id}", response_model=schemas.RobotArmGripParams
)
def delete_robot_arm_grip_params(
    params_id: int, db: Session = Depends(get_db)
) -> t.Any:
    params = crud.robot_arm_grip_params.get(db, id=params_id)
    if not params:
        raise HTTPException(status_code=404, detail="Grip parameters not found")
    return crud.robot_arm_grip_params.remove(db, id=params_id)


@app.get("/robot-arm-waypoints", response_model=schemas.RobotArmWaypoints)
def get_robot_arm_waypoints(
    tool_id: t.Union[int, str], db: Session = Depends(get_db)
) -> t.Any:
    # Get all related data for the tool
    tool = crud.tool.get(db, tool_id, True)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    locations = crud.robot_arm_location.get_all_by(db, obj_in={"tool_id": tool.id})
    sequences = crud.robot_arm_sequence.get_all_by(db, obj_in={"tool_id": tool.id})
    motion_profiles = crud.robot_arm_motion_profile.get_all_by(
        db, obj_in={"tool_id": tool.id}
    )
    grip_params = crud.robot_arm_grip_params.get_all_by(db, obj_in={"tool_id": tool.id})
    return {
        "id": tool.id,
        "name": f"Waypoints for Tool {tool_id}",
        "locations": locations,
        "sequences": sequences,
        "motion_profiles": motion_profiles,
        "grip_params": grip_params,
        "tool_id": tool.id,
    }


# Schemas for waypoint data
class TeachPoint(BaseModel):
    name: str
    coordinates: str
    type: str = "location"
    loc_type: str = "j"


class Command(BaseModel):
    command: str
    params: Dict
    order: int


class Sequence(BaseModel):
    name: str
    description: Optional[str] = ""
    commands: List[Command]
    tool_id: int = 1


class MotionProfile(BaseModel):
    name: str
    profile_id: int
    speed: float = 100
    speed2: float = 100
    acceleration: float = 100
    deceleration: float = 100
    accel_ramp: float = 0.2
    decel_ramp: float = 0.2
    inrange: int = 1
    straight: int = 0
    tool_id: int = 1


class GripParam(BaseModel):
    name: str
    width: float
    force: float = 15
    speed: float = 10
    tool_id: int = 1


class WaypointData(BaseModel):
    teach_points: Optional[List[TeachPoint]] = None
    sequences: Optional[List[Sequence]] = None
    motion_profiles: Optional[List[MotionProfile]] = None
    grip_params: Optional[List[GripParam]] = None


@app.post("/waypoints/upload")
async def upload_waypoints(
    file: UploadFile = File(...),
    tool_id: int = Form(...),
    db: Session = Depends(get_db),
):
    return await handle_waypoint_upload(file, tool_id, db)


class ProtocolCreate(BaseModel):
    name: str
    category: str
    workcell_id: int
    description: Optional[str] = None
    icon: Optional[str] = None
    params: Dict[str, Any]
    commands: List[Dict[str, Any]]
    version: Optional[int] = 1
    is_active: Optional[bool] = True


class ProtocolUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    params: Optional[Dict[str, Any]] = None
    commands: Optional[List[Dict[str, Any]]] = None
    version: Optional[int] = None
    is_active: Optional[bool] = None


@app.post("/protocols", response_model=schemas.Protocol)
async def create_protocol(protocol: ProtocolCreate, db: Session = Depends(get_db)):
    try:
        # Check if workcell exists
        workcell = db.query(models.Workcell).get(protocol.workcell_id)
        if not workcell:
            logging.error(f"Workcell with ID {protocol.workcell_id} not found")
            raise HTTPException(
                status_code=400,
                detail=f"Workcell with ID {protocol.workcell_id} not found",
            )

        # Create new protocol with validated data
        db_protocol = Protocol(
            name=protocol.name,
            category=protocol.category,
            workcell_id=protocol.workcell_id,
            description=protocol.description,
            icon=protocol.icon,
            params=protocol.params or {},
            commands=protocol.commands or [],
            version=protocol.version or 1,
            is_active=protocol.is_active if protocol.is_active is not None else True,
        )

        try:
            db.add(db_protocol)
            db.flush()  # Flush to get the ID without committing

            # Verify the protocol can be converted to dict (catches serialization issues)
            db.commit()
            db.refresh(db_protocol)
            return db_protocol

        except Exception as e:
            db.rollback()
            logging.error(f"Database error while creating protocol: {str(e)}")
            logging.error(f"Full error details: {repr(e)}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Unexpected error while creating protocol: {str(e)}")
        logging.error(f"Full error details: {repr(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.put("/protocols/{id}", response_model=schemas.Protocol)
async def update_protocol(
    id: int, protocol: ProtocolUpdate, db: Session = Depends(get_db)
):
    db_protocol = db.query(Protocol).get(id)
    if not db_protocol:
        raise HTTPException(status_code=404, detail="Protocol not found")

    update_data = protocol.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_protocol, key, value)

    db.commit()
    db.refresh(db_protocol)
    return db_protocol


@app.delete("/protocols/{id}")
async def delete_protocol(id: int, db: Session = Depends(get_db)):
    db_protocol = db.query(Protocol).get(id)
    if not db_protocol:
        raise HTTPException(status_code=404, detail="Protocol not found")

    db.delete(db_protocol)
    db.commit()
    return {"success": True}


@app.get("/protocols/{id}", response_model=schemas.Protocol)
async def get_protocol(id: int, db: Session = Depends(get_db)):
    db_protocol = db.query(Protocol).get(id)
    if not db_protocol:
        raise HTTPException(status_code=404, detail="Protocol not found")
    return db_protocol


@app.get("/protocols", response_model=List[schemas.Protocol])
async def get_protocols(
    workcell_id: Optional[int] = None,
    workcell_name: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Protocol)

    if workcell_id is not None:
        query = query.filter(Protocol.workcell_id == workcell_id)
    elif workcell_name is not None:
        # Get workcell by name and then filter by its ID
        workcell = (
            db.query(models.Workcell)
            .filter(models.Workcell.name == workcell_name)
            .first()
        )
        if workcell:
            query = query.filter(Protocol.workcell_id == workcell.id)
        else:
            # If workcell not found, return empty list
            return []

    if is_active is not None:
        query = query.filter(models.Protocol.is_active == is_active)

    protocols = query.all()
    return [protocol for protocol in protocols]


# Hotel endpoints
@app.get("/hotels", response_model=list[schemas.Hotel])
def get_hotels(
    db: Session = Depends(get_db), workcell_name: Optional[str] = None
) -> t.Any:
    if workcell_name:
        workcell = crud.workcell.get_by(db, obj_in={"name": workcell_name})
        if not workcell:
            raise HTTPException(status_code=404, detail="Workcell not found")
        return crud.hotel.get_all_by(db, obj_in={"workcell_id": workcell.id})
    return crud.hotel.get_all(db)


@app.get("/hotels/{hotel_id}", response_model=schemas.Hotel)
def get_hotel(hotel_id: int, db: Session = Depends(get_db)) -> t.Any:
    hotel = crud.hotel.get(db, id=hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel


@app.post("/hotels", response_model=schemas.Hotel)
def create_hotel(hotel: schemas.HotelCreate, db: Session = Depends(get_db)) -> t.Any:
    return crud.hotel.create(db, obj_in=hotel)


@app.put("/hotels/{hotel_id}", response_model=schemas.Hotel)
def update_hotel(
    hotel_id: int, hotel_update: schemas.HotelUpdate, db: Session = Depends(get_db)
) -> t.Any:
    hotel = crud.hotel.get(db, id=hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return crud.hotel.update(db, db_obj=hotel, obj_in=hotel_update)


@app.delete("/hotels/{hotel_id}", response_model=schemas.Hotel)
def delete_hotel(hotel_id: int, db: Session = Depends(get_db)) -> t.Any:
    hotel = crud.hotel.get(db, id=hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return crud.hotel.remove(db, id=hotel_id)
