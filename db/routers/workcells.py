import typing as t
import json
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.encoders import jsonable_encoder
from starlette.background import BackgroundTask
import tempfile
import os
import logging
from sqlalchemy.orm import Session

from db import crud, schemas
import db.models.inventory_models as models
from db.initializers import (
    create_default_motion_profile,
    create_default_grip_params,
)

from ..dependencies import get_db

router = APIRouter()


@router.get("", response_model=list[schemas.Workcell])
def get_workcells(db: Session = Depends(get_db)) -> t.Any:
    workcells = crud.workcell.get_all(db)
    return [workcell for workcell in workcells]


@router.get("/{workcell_id}", response_model=schemas.Workcell)
def get_workcell(workcell_id: int, db: Session = Depends(get_db)) -> t.Any:
    workcell = crud.workcell.get(db, id=workcell_id)
    if workcell is None:
        raise HTTPException(status_code=404, detail="Workcell not found")
    return workcell


@router.post("", response_model=schemas.Workcell)
def create_workcell(
    workcell: schemas.WorkcellCreate, db: Session = Depends(get_db)
) -> t.Any:
    db_workcell = crud.workcell.create(db, obj_in=workcell)
    return db_workcell


@router.put("/{workcell_id}", response_model=schemas.Workcell)
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


@router.delete("/{workcell_id}", response_model=schemas.Workcell)
def delete_workcell(workcell_id: int, db: Session = Depends(get_db)) -> t.Any:
    workcell = crud.workcell.get(db, id=workcell_id)
    if workcell is None:
        raise HTTPException(status_code=404, detail="Workcell not found")
    deleted_workcell = crud.workcell.remove(db, id=workcell_id)
    return deleted_workcell


@router.get("/{workcell_id}/export")
def export_workcell_config(workcell_id: int, db: Session = Depends(get_db)) -> t.Any:
    """Export a workcell configuration including all related data as a downloadable JSON file."""
    workcell = crud.workcell.get(db, id=workcell_id)
    if workcell is None:
        raise HTTPException(status_code=404, detail="Workcell not found")

    # Explicitly load tools and protocols
    _ = workcell.tools
    _ = workcell.protocols
    _ = workcell.hotels

    # Get all nests for the workcell (from both tools and hotels)
    nests = crud.nest.get_all_nests_by_workcell_id(db=db, workcell_id=workcell.id)

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

    # Get workcell-specific entities
    scripts = crud.scripts.get_all_by(db, obj_in={"workcell_id": workcell.id})
    variables = crud.variables.get_all_by(db, obj_in={"workcell_id": workcell.id})
    labware = crud.labware.get_all_by(db, obj_in={"workcell_id": workcell.id})
    forms = crud.form.get_all_by(db, obj_in={"workcell_id": workcell.id})
    script_folders = crud.script_folders.get_all_by(db, obj_in={"workcell_id": workcell.id})

    # Create a temporary file for the JSON content
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as temp_file:
        temp_file_path = temp_file.name
        # Serialize the workcell to JSON and write to the file
        workcell_json = jsonable_encoder(workcell)

        # Add the inventory and entity data to the export
        workcell_json["nests"] = jsonable_encoder(nests)
        workcell_json["plates"] = jsonable_encoder(plates)
        workcell_json["wells"] = jsonable_encoder(wells)
        workcell_json["reagents"] = jsonable_encoder(reagents)
        workcell_json["scripts"] = jsonable_encoder(scripts)
        workcell_json["variables"] = jsonable_encoder(variables)
        workcell_json["labware"] = jsonable_encoder(labware)
        workcell_json["forms"] = jsonable_encoder(forms)
        workcell_json["script_folders"] = jsonable_encoder(script_folders)

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
        ),
    )



#TODO: This function is insanely long, break it up into smaller functions.
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

        # ID mapping dictionaries to track old_id -> new_id
        hotel_id_mapping = {}
        tool_id_mapping = {}
        nest_id_mapping = {}
        plate_id_mapping = {}
        well_id_mapping = {}

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

        # Process hotels FIRST (no dependencies)
        if "hotels" in workcell_data and isinstance(workcell_data["hotels"], list):
            for hotel_data in workcell_data["hotels"]:
                if not isinstance(hotel_data, dict) or "name" not in hotel_data:
                    continue

                old_hotel_id = hotel_data.get("id")
                hotel_data["workcell_id"] = workcell.id

                # Check if this hotel already exists in the workcell
                existing_hotel = None
                for h in workcell.hotels:
                    if h.name == hotel_data["name"]:
                        existing_hotel = h
                        break

                if existing_hotel:
                    # Update existing hotel
                    hotel_update = {k: v for k, v in hotel_data.items() if k != "id"}
                    updated_hotel = crud.hotel.update(
                        db,
                        db_obj=existing_hotel,
                        obj_in=schemas.HotelUpdate(**hotel_update),
                    )
                    if old_hotel_id:
                        hotel_id_mapping[old_hotel_id] = updated_hotel.id
                else:
                    # Create new hotel
                    hotel_create = {k: v for k, v in hotel_data.items() if k != "id"}
                    new_hotel = crud.hotel.create(db, obj_in=schemas.HotelCreate(**hotel_create))
                    if old_hotel_id:
                        hotel_id_mapping[old_hotel_id] = new_hotel.id

        # Process tools SECOND (no dependencies)
        if "tools" in workcell_data and isinstance(workcell_data["tools"], list):
            for tool_data in workcell_data["tools"]:
                if (
                    not isinstance(tool_data, dict)
                    or "name" not in tool_data
                    or "type" not in tool_data
                ):
                    continue

                old_tool_id = tool_data.get("id")
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
                    updated_tool = crud.tool.update(
                        db,
                        db_obj=existing_tool,
                        obj_in=schemas.ToolUpdate(**tool_update),
                    )
                    if old_tool_id:
                        tool_id_mapping[old_tool_id] = updated_tool.id
                else:
                    # Create new tool
                    new_tool = crud.tool.create(
                        db, obj_in=schemas.ToolCreate(**tool_data)
                    )
                    if old_tool_id:
                        tool_id_mapping[old_tool_id] = new_tool.id
                    
                    # Create default motion profile and grip params if it's a pf400
                    if new_tool.type == "pf400":
                        create_default_motion_profile(db, new_tool.id)
                        create_default_grip_params(db, new_tool.id)
                        logging.info(
                            f"Created default profiles for imported PF400 tool: {new_tool.name}"
                        )

        # Process nests THIRD (depends on tools and hotels)
        if "nests" in workcell_data and isinstance(workcell_data["nests"], list):
            for nest_data in workcell_data["nests"]:
                if not isinstance(nest_data, dict) or "name" not in nest_data:
                    continue

                old_nest_id = nest_data.get("id")

                # Remap foreign keys using the mapping dictionaries
                if nest_data.get("hotel_id") and nest_data["hotel_id"] in hotel_id_mapping:
                    nest_data["hotel_id"] = hotel_id_mapping[nest_data["hotel_id"]]
                elif nest_data.get("hotel_id"):
                    # If we can't map it, set to null to avoid FK constraint
                    logging.warning(f"Could not map hotel_id {nest_data['hotel_id']} for nest {nest_data['name']}")
                    nest_data["hotel_id"] = None

                if nest_data.get("tool_id") and nest_data["tool_id"] in tool_id_mapping:
                    nest_data["tool_id"] = tool_id_mapping[nest_data["tool_id"]]
                elif nest_data.get("tool_id"):
                    # If we can't map it, set to null to avoid FK constraint
                    logging.warning(f"Could not map tool_id {nest_data['tool_id']} for nest {nest_data['name']}")
                    nest_data["tool_id"] = None

                # Check if this nest already exists
                existing_nest = None
                try:
                    if old_nest_id is not None:
                        existing_nest = crud.nest.get(db, id=int(old_nest_id))
                except Exception:
                    existing_nest = None

                if existing_nest:
                    # Update existing nest
                    nest_update = {k: v for k, v in nest_data.items() if k != "id"}
                    updated_nest = crud.nest.update(
                        db,
                        db_obj=existing_nest,
                        obj_in=schemas.NestUpdate(**nest_update),
                    )
                    if old_nest_id:
                        nest_id_mapping[old_nest_id] = updated_nest.id
                else:
                    # Create new nest
                    nest_create = {k: v for k, v in nest_data.items() if k != "id"}
                    new_nest = crud.nest.create(db, obj_in=schemas.NestCreate(**nest_create))
                    if old_nest_id:
                        nest_id_mapping[old_nest_id] = new_nest.id

        # Process plates FOURTH (depends on nests)
        if "plates" in workcell_data and isinstance(workcell_data["plates"], list):
            for plate_data in workcell_data["plates"]:
                if not isinstance(plate_data, dict) or "barcode" not in plate_data:
                    continue

                old_plate_id = plate_data.get("id")

                # Remap nest_id
                if plate_data.get("nest_id") and plate_data["nest_id"] in nest_id_mapping:
                    plate_data["nest_id"] = nest_id_mapping[plate_data["nest_id"]]
                elif plate_data.get("nest_id"):
                    logging.warning(f"Could not map nest_id {plate_data['nest_id']} for plate {plate_data.get('name')}")
                    plate_data["nest_id"] = None

                # Check if this plate already exists
                existing_plate = None
                try:
                    if old_plate_id is not None:
                        existing_plate = crud.plate.get(db, id=int(old_plate_id))
                    else:
                        existing_plate = crud.plate.get_by(
                            db, obj_in={"barcode": plate_data["barcode"]}
                        )
                except Exception:
                    existing_plate = None

                if existing_plate:
                    # Update existing plate
                    plate_update = {k: v for k, v in plate_data.items() if k != "id"}
                    updated_plate = crud.plate.update(
                        db,
                        db_obj=existing_plate,
                        obj_in=schemas.PlateUpdate(**plate_update),
                    )
                    if old_plate_id:
                        plate_id_mapping[old_plate_id] = updated_plate.id
                else:
                    # Create new plate
                    plate_create = {k: v for k, v in plate_data.items() if k != "id"}
                    new_plate = crud.plate.create(db, obj_in=schemas.PlateCreate(**plate_create))
                    if old_plate_id:
                        plate_id_mapping[old_plate_id] = new_plate.id

        # Process wells FIFTH (depends on plates)
        if "wells" in workcell_data and isinstance(workcell_data["wells"], list):
            for well_data in workcell_data["wells"]:
                if not isinstance(well_data, dict) or "plate_id" not in well_data:
                    continue

                old_well_id = well_data.get("id")

                # Remap plate_id
                if well_data.get("plate_id") and well_data["plate_id"] in plate_id_mapping:
                    well_data["plate_id"] = plate_id_mapping[well_data["plate_id"]]
                elif well_data.get("plate_id"):
                    logging.warning(f"Could not map plate_id {well_data['plate_id']} for well")
                    continue  # Skip this well if we can't map the plate

                # Check if this well already exists
                existing_well = None
                try:
                    if old_well_id is not None:
                        existing_well = crud.well.get(db, id=int(old_well_id))
                    elif "row" in well_data and "column" in well_data:
                        existing_well = crud.well.get_by(
                            db,
                            obj_in={
                                "plate_id": well_data["plate_id"],
                                "row": well_data["row"],
                                "column": well_data["column"],
                            },
                        )
                except Exception:
                    existing_well = None

                if existing_well:
                    # Update existing well
                    well_update = {k: v for k, v in well_data.items() if k != "id"}
                    updated_well = crud.well.update(
                        db,
                        db_obj=existing_well,
                        obj_in=schemas.WellUpdate(**well_update),
                    )
                    if old_well_id:
                        well_id_mapping[old_well_id] = updated_well.id
                else:
                    # Create new well
                    well_create = {k: v for k, v in well_data.items() if k != "id"}
                    new_well = crud.well.create(db, obj_in=schemas.WellCreate(**well_create))
                    if old_well_id:
                        well_id_mapping[old_well_id] = new_well.id

        # Process reagents LAST (depends on wells)
        if "reagents" in workcell_data and isinstance(workcell_data["reagents"], list):
            for reagent_data in workcell_data["reagents"]:
                if (
                    not isinstance(reagent_data, dict)
                    or "well_id" not in reagent_data
                    or "name" not in reagent_data
                ):
                    continue

                # Remap well_id
                if reagent_data.get("well_id") and reagent_data["well_id"] in well_id_mapping:
                    reagent_data["well_id"] = well_id_mapping[reagent_data["well_id"]]
                elif reagent_data.get("well_id"):
                    logging.warning(f"Could not map well_id {reagent_data['well_id']} for reagent {reagent_data['name']}")
                    continue  # Skip this reagent if we can't map the well

                # Check if this reagent already exists
                existing_reagent = None
                try:
                    reagent_id = reagent_data.get("id")
                    if reagent_id is not None:
                        existing_reagent = crud.reagent.get(db, id=int(reagent_id))
                    else:
                        existing_reagent = crud.reagent.get_by(
                            db,
                            obj_in={
                                "well_id": reagent_data["well_id"],
                                "name": reagent_data["name"],
                            },
                        )
                except Exception:
                    existing_reagent = None

                if existing_reagent:
                    # Update existing reagent
                    reagent_update = {
                        k: v for k, v in reagent_data.items() if k != "id"
                    }
                    crud.reagent.update(
                        db,
                        db_obj=existing_reagent,
                        obj_in=schemas.ReagentUpdate(**reagent_update),
                    )
                else:
                    # Create new reagent
                    reagent_create = {
                        k: v for k, v in reagent_data.items() if k != "id"
                    }
                    crud.reagent.create(
                        db, obj_in=schemas.ReagentCreate(**reagent_create)
                    )

        # Process scripts if they exist in the import data
        if "scripts" in workcell_data and isinstance(workcell_data["scripts"], list):
            for script_data in workcell_data["scripts"]:
                if not isinstance(script_data, dict) or "name" not in script_data:
                    continue

                script_data["workcell_id"] = workcell.id
                existing_script = crud.scripts.get_by(
                    db, obj_in={"name": script_data["name"], "workcell_id": workcell.id}
                )

                if existing_script:
                    script_update = {k: v for k, v in script_data.items() if k != "id"}
                    crud.scripts.update(
                        db,
                        db_obj=existing_script,
                        obj_in=schemas.ScriptUpdate(**script_update),
                    )
                else:
                    script_create = {k: v for k, v in script_data.items() if k != "id"}
                    crud.scripts.create(db, obj_in=schemas.ScriptCreate(**script_create))

        # Process variables if they exist in the import data
        if "variables" in workcell_data and isinstance(workcell_data["variables"], list):
            for variable_data in workcell_data["variables"]:
                if not isinstance(variable_data, dict) or "name" not in variable_data:
                    continue

                variable_data["workcell_id"] = workcell.id
                existing_variable = crud.variables.get_by(
                    db, obj_in={"name": variable_data["name"], "workcell_id": workcell.id}
                )

                if existing_variable:
                    variable_update = {k: v for k, v in variable_data.items() if k != "id"}
                    crud.variables.update(
                        db,
                        db_obj=existing_variable,
                        obj_in=schemas.VariableUpdate(**variable_update),
                    )
                else:
                    variable_create = {k: v for k, v in variable_data.items() if k != "id"}
                    crud.variables.create(db, obj_in=schemas.VariableCreate(**variable_create))

        # Process labware if they exist in the import data
        if "labware" in workcell_data and isinstance(workcell_data["labware"], list):
            for labware_data in workcell_data["labware"]:
                if not isinstance(labware_data, dict) or "name" not in labware_data:
                    continue

                labware_data["workcell_id"] = workcell.id
                existing_labware = crud.labware.get_by(
                    db, obj_in={"name": labware_data["name"], "workcell_id": workcell.id}
                )

                labware_fields = {
                    "name": labware_data["name"],
                    "description": labware_data.get("description", ""),
                    "number_of_rows": labware_data.get("number_of_rows", 8),
                    "number_of_columns": labware_data.get("number_of_columns", 12),
                    "z_offset": labware_data.get("z_offset", 0.0),
                    "width": labware_data.get("width", 0.0),
                    "height": labware_data.get("height", 0.0),
                    "plate_lid_offset": labware_data.get("plate_lid_offset", 0.0),
                    "lid_offset": labware_data.get("lid_offset", 0.0),
                    "stack_height": labware_data.get("stack_height", 0.0),
                    "has_lid": labware_data.get("has_lid", False),
                    "image_url": labware_data.get("image_url", ""),
                    "workcell_id": workcell.id,
                }

                if existing_labware:
                    crud.labware.update(
                        db,
                        db_obj=existing_labware,
                        obj_in=schemas.LabwareUpdate(**labware_fields),
                    )
                else:
                    crud.labware.create(
                        db, obj_in=schemas.LabwareCreate(**labware_fields)
                    )

        # Process script folders if they exist in the import data
        if "script_folders" in workcell_data and isinstance(workcell_data["script_folders"], list):
            for folder_data in workcell_data["script_folders"]:
                if not isinstance(folder_data, dict) or "name" not in folder_data:
                    continue

                folder_data["workcell_id"] = workcell.id
                existing_folder = crud.script_folders.get_by(
                    db, obj_in={"name": folder_data["name"], "workcell_id": workcell.id}
                )

                if existing_folder:
                    folder_update = {k: v for k, v in folder_data.items() if k != "id"}
                    crud.script_folders.update(
                        db,
                        db_obj=existing_folder,
                        obj_in=schemas.ScriptFolderUpdate(**folder_update),
                    )
                else:
                    folder_create = {k: v for k, v in folder_data.items() if k != "id"}
                    crud.script_folders.create(db, obj_in=schemas.ScriptFolderCreate(**folder_create))
        
        # Process forms if they exist in the import data
        if "forms" in workcell_data and isinstance(workcell_data["forms"], list):
            for form_data in workcell_data["forms"]:
                if not isinstance(form_data, dict) or "name" not in form_data:
                    continue

                form_data["workcell_id"] = workcell.id
                existing_form = crud.form.get_by(
                    db, obj_in={"name": form_data["name"], "workcell_id": workcell.id}
                )

                form_fields = {
                    "name": form_data["name"],
                    "fields": form_data.get("fields", []),
                    "background_color": form_data.get("background_color"),
                    "font_color": form_data.get("font_color"),
                    "workcell_id": workcell.id,
                }

                if existing_form:
                    crud.form.update(
                        db,
                        db_obj=existing_form,
                        obj_in=schemas.FormUpdate(**form_fields),
                    )
                else:
                    crud.form.create(
                        db, obj_in=schemas.FormCreate(**form_fields)
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
        # Commit all changes made within the try block
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
