import json
import xml.etree.ElementTree as ET
from xml.etree.ElementTree import ParseError
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from db import crud
from db.models.inventory_models import RobotArmLocation
from db import schemas
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import re


# Schemas for waypoint data
class TeachPoint(BaseModel):
    name: str
    coordinates: str
    type: str = "location"
    loc_type: str = "j"
    orientation: Optional[str] = None


class Command(BaseModel):
    command: str
    params: Dict
    order: int


class RobotSequence(BaseModel):
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
    sequences: Optional[List[RobotSequence]] = None
    motion_profiles: Optional[List[MotionProfile]] = None
    grip_params: Optional[List[GripParam]] = None


def get_unique_name(db: Session, name: str, table, tool_id: int) -> str:
    """Generate a unique name by appending a number if the name already exists."""
    base_name = name
    counter = 1
    while db.query(table).filter_by(name=name, tool_id=tool_id).first():
        name = f"{base_name}_{counter}"
        counter += 1
    return name


def is_valid_location_name(name):
    return bool(re.search(r"[a-zA-Z]", name))  # Ensure at least one letter is present


async def handle_waypoint_upload(file: UploadFile, tool_id: int, db: Session):
    try:
        content = await file.read()
        if not file.filename:
            raise ValueError("Filename is required")
        file_ext = file.filename.lower().split(".")[-1]

        if file_ext == "xml":
            try:
                root = ET.fromstring(content.decode())
                data: Dict[str, Any] = {}

                # Parse locations
                locations = root.findall(".//Location")
                if locations:
                    data["teach_points"] = []
                    for loc in locations:
                        name_elem = loc.find("Name")
                        if name_elem is None or name_elem.text is None:
                            continue
                        name: str = name_elem.text
                        # Skip if empty or invalid name
                        if not name or not is_valid_location_name(name):
                            continue

                        # Get joint values, handling missing or empty text
                        joints = []
                        for i in range(1, 7):
                            joint = loc.find(f"Joint{i}")
                            joint_val = "0"
                            if joint is not None and joint.text:
                                joint_val = joint.text.strip()
                                if not joint_val:  # Handle empty string
                                    joint_val = "0"
                            joints.append(joint_val)

                        # Check if all joint values represent zero
                        all_zero = True
                        for val in joints:
                            try:
                                if float(val) != 0.0:
                                    all_zero = False
                                    break
                            except ValueError:
                                # If conversion fails, it's not zero
                                all_zero = False
                                break

                        # Skip this location if all joints are zero
                        if all_zero:
                            continue

                        data["teach_points"].append(
                            {
                                "name": name,
                                "coordinates": " ".join(joints),
                                "type": "location",
                                "loc_type": "j",
                            }
                        )

                # Parse sequences
                xml_sequences: List[ET.Element] = root.findall(".//Sequence")
                if xml_sequences:
                    data["sequences"] = []
                    sequence_counter = 1
                    for xml_seq in xml_sequences:
                        name = xml_seq.get("Name", "")  # Get name from attribute
                        if not name:  # Give default name if empty
                            name = f"Sequence_{sequence_counter}"
                            sequence_counter += 1
                        commands: List[Dict[str, Any]] = []
                        for cmd in xml_seq.findall(".//RobotCommand"):
                            cmd_type = cmd.get(
                                "{http://www.w3.org/2001/XMLSchema-instance}type"
                            )
                            if cmd_type == "MoveCommand":
                                loc_name = cmd.get("LocationName", "")
                                if loc_name:
                                    commands.append(
                                        {
                                            "command": "move",
                                            "params": {
                                                "waypoint": loc_name,
                                                "motion_profile_id": 1,
                                            },
                                            "order": len(commands),
                                        }
                                    )
                            elif cmd_type == "PickPlateCommand":
                                grip_width = cmd.get("GripWidth", "130")
                                commands.append(
                                    {
                                        "command": "grasp_plate",
                                        "params": {
                                            "width": float(grip_width),
                                            "force": 15,
                                            "speed": 10,
                                        },
                                        "order": len(commands),
                                    }
                                )
                            elif cmd_type == "PlacePlateCommand":
                                grip_width = cmd.get("GripWidth", "130")
                                commands.append(
                                    {
                                        "command": "release_plate",
                                        "params": {
                                            "width": float(grip_width),
                                            "speed": 10,
                                        },
                                        "order": len(commands),
                                    }
                                )
                        data["sequences"].append(
                            {
                                "name": name,
                                "description": "",
                                "commands": commands,
                                "tool_id": tool_id,
                            }
                        )

                # Parse motion profiles
                profiles = root.findall(".//PreciseFlexMotionProfile")
                if profiles:
                    data["motion_profiles"] = []
                    profile_counter = 1
                    for p in profiles:
                        name = p.get("Name", "")  # Get name from attribute
                        if not name:  # Give default name if empty
                            name = f"Profile_{profile_counter}"
                            profile_counter += 1

                        # Get values from attributes with defaults
                        data["motion_profiles"].append(
                            {
                                "name": name,
                                # Auto-increment profile_id
                                "profile_id": profile_counter,
                                "speed": float(p.get("Velocity", 100)),
                                "speed2": float(p.get("Velocity", 100)),
                                "acceleration": float(p.get("Acceleration", 100)),
                                "deceleration": float(p.get("Deceleration", 100)),
                                "accel_ramp": float(p.get("AccelerationRamp", 0.2)),
                                "decel_ramp": float(p.get("DecelerationRamp", 0.2)),
                                "inrange": int(p.get("InRange", 1)),
                                "straight": (
                                    1 if p.get("Straight", "").lower() == "true" else 0
                                ),
                                "tool_id": tool_id,
                            }
                        )

            except ParseError as e:
                raise HTTPException(
                    status_code=400, detail=f"Invalid XML format: {str(e)}"
                )
        elif file_ext == "json":
            try:
                data = json.loads(content.decode())

                # Handle direct sequence array format
                if isinstance(data, list):
                    # Create a sequence object from the command array
                    data = {
                        "sequences": [
                            {
                                "name": file.filename.replace(".json", ""),
                                "description": "Imported sequence",
                                "commands": [
                                    {
                                        "command": cmd["command"],
                                        "params": cmd["params"],
                                        "order": idx,
                                    }
                                    for idx, cmd in enumerate(data)
                                ],
                                "tool_id": tool_id,
                            }
                        ]
                    }
                elif data.get("data"):
                    data = data["data"]

                # Convert locations to teach_points
                if "locations" in data:
                    data["teach_points"] = []
                    for name, loc_data in data["locations"].items():
                        teach_point = {
                            "name": name,
                            "coordinates": loc_data["loc"],
                            "type": "location",
                            "loc_type": loc_data.get("loc_type", "j"),
                        }
                        data["teach_points"].append(teach_point)
                if "nests" in data and isinstance(data["nests"], dict):
                    for name, nest_data in data["nests"].items():
                        # The nest data has keys: "approach_path",
                        # "loc", "orientation", "safe_loc"
                        # We ignore approach_path and safe_loc.
                        loc_info = nest_data.get("loc")
                        if isinstance(loc_info, dict):
                            coordinates = loc_info.get("loc")
                            loc_type = loc_info.get("loc_type", "j")
                        else:
                            coordinates = loc_info
                            loc_type = "j"

                        teach_point = {
                            "name": name,
                            "coordinates": coordinates,
                            "type": "nest",
                            "loc_type": loc_type,
                            "orientation": nest_data.get("orientation"),
                        }
                        data["teach_points"].append(teach_point)

                # Fix motion profiles format
                if "motion_profiles" in data:
                    profile_counter = 1
                    fixed_profiles = []
                    for profile in data["motion_profiles"]:
                        if "name" not in profile:
                            profile["name"] = f"Profile_{profile_counter}"
                            profile_counter += 1
                        if "profile_id" not in profile and "id" in profile:
                            profile["profile_id"] = profile["id"]
                        fixed_profiles.append(profile)
                    data["motion_profiles"] = fixed_profiles

                # Fix grip parameters format
                if "grip_params" in data and isinstance(data["grip_params"], dict):
                    grip_params_list = []
                    param_counter = 1
                    for grip_type, params in data["grip_params"].items():
                        params["name"] = params.get(
                            "name", f"GripParams_{param_counter}"
                        )
                        params["tool_id"] = tool_id
                        grip_params_list.append(params)
                        param_counter += 1
                    data["grip_params"] = grip_params_list

            except json.JSONDecodeError as e:
                raise HTTPException(
                    status_code=400, detail=f"Invalid JSON format: {str(e)}"
                )
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload XML or JSON file.",
            )

        # Validate data against schema
        waypoint_data = WaypointData(**data)

        # Store data in database within a transaction
        try:
            # Start transaction
            db.begin()

            results: Dict[str, List[Any]] = {
                "teach_points": [],
                "sequences": [],
                "motion_profiles": [],
                "grip_params": [],
            }

            # Store teach points
            if waypoint_data.teach_points:
                for point in waypoint_data.teach_points:
                    # Get unique name for the location
                    unique_name = get_unique_name(
                        db, point.name, RobotArmLocation, tool_id
                    )

                    # Ensure coordinates are in string format
                    coords = (
                        point.coordinates
                        if isinstance(point.coordinates, str)
                        else " ".join(map(str, point.coordinates))
                    )

                    location = crud.robot_arm_location.create(
                        db,
                        obj_in=schemas.RobotArmLocationCreate(
                            name=unique_name,
                            location_type=point.loc_type,
                            coordinates=coords,
                            tool_id=tool_id,
                            orientation="landscape",
                        ),
                    )
                    results["teach_points"].append(location)

            # Store sequences
            if waypoint_data.sequences:
                sequence_list: List[schemas.RobotArmSequence] = []

                for seq in waypoint_data.sequences:
                    # Convert Command objects to dictionaries
                    commands_dict: List[Dict[str, Any]] = [
                        {
                            "command": cmd.command,
                            "params": cmd.params,
                            "order": cmd.order,
                        }
                        for cmd in seq.commands
                    ]
                    sequence = crud.robot_arm_sequence.create(
                        db,
                        obj_in=schemas.RobotArmSequenceCreate(
                            name=seq.name,
                            tool_id=tool_id,
                            description=seq.description,
                            commands=commands_dict,
                        ),
                    )
                    sequence_list.append(sequence)

            # Store motion profiles
            if waypoint_data.motion_profiles:
                motion_profiles: List[schemas.RobotArmMotionProfile] = []
                for profile in waypoint_data.motion_profiles:
                    motion_profile = crud.robot_arm_motion_profile.create(
                        db,
                        obj_in=schemas.RobotArmMotionProfileCreate(
                            name=profile.name,
                            tool_id=tool_id,
                            profile_id=profile.profile_id,
                            speed=profile.speed,
                            speed2=profile.speed2,
                            acceleration=profile.acceleration,
                            deceleration=profile.deceleration,
                            accel_ramp=profile.accel_ramp,
                            decel_ramp=profile.decel_ramp,
                            inrange=profile.inrange,
                            straight=profile.straight,
                        ),
                    )
                    motion_profiles.append(motion_profile)

            # Store grip parameters
            if waypoint_data.grip_params:
                grip_params: List[schemas.RobotArmGripParams] = []
                for param in waypoint_data.grip_params:
                    grip_param = crud.robot_arm_grip_params.create(
                        db,
                        obj_in=schemas.RobotArmGripParamsCreate(
                            name=param.name,
                            tool_id=tool_id,
                            width=param.width,
                            force=param.force,
                            speed=param.speed,
                        ),
                    )
                    grip_params.append(grip_param)

            # Commit transaction
            db.commit()

            # Create summary of imported items
            summary = {key: len(value) for key, value in results.items() if value}

            return {
                "message": "Waypoints uploaded and stored successfully",
                "summary": summary,
                "data": waypoint_data.dict(exclude_none=True),
            }

        except Exception as e:
            # Rollback transaction on error
            db.rollback()
            raise HTTPException(
                status_code=500, detail=f"Failed to store waypoint data: {str(e)}"
            )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
