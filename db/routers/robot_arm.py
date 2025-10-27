from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
import typing as t
from typing import Optional

from db import crud, schemas
from ..dependencies import get_db

router = APIRouter()


# Robot Arm Locations
@router.get("/locations", response_model=list[schemas.RobotArmLocation])
def get_robot_arm_locations(
    db: Session = Depends(get_db), tool_id: Optional[t.Union[int, str]] = None
) -> t.Any:
    if tool_id:
        tool = crud.tool.get(db, tool_id, True)
        if not tool:
            raise HTTPException(status_code=404, detail="Tool not found")
        return crud.robot_arm_location.get_all_by(db, obj_in={"tool_id": int(tool.id)})

    return crud.robot_arm_location.get_all(db)


@router.post("/locations", response_model=schemas.RobotArmLocation)
def create_robot_arm_location(
    location: schemas.RobotArmLocationCreate, db: Session = Depends(get_db)
) -> t.Any:
    return crud.robot_arm_location.create(db, obj_in=location)


@router.put("/locations/{location_id}", response_model=schemas.RobotArmLocation)
def update_robot_arm_location(
    location_id: int,
    location: schemas.RobotArmLocationUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    db_location = crud.robot_arm_location.get(db, id=location_id)
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")
    return crud.robot_arm_location.update(db, db_obj=db_location, obj_in=location)


@router.delete("/locations/{location_id}", response_model=schemas.RobotArmLocation)
def delete_robot_arm_location(location_id: int, db: Session = Depends(get_db)) -> t.Any:
    location = crud.robot_arm_location.get(db, id=location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return crud.robot_arm_location.remove(db, id=location_id)


# Robot Arm Sequences
@router.get("/sequences", response_model=list[schemas.RobotArmSequence])
def get_robot_arm_sequences(
    db: Session = Depends(get_db), tool_id: Optional[int] = None
) -> t.Any:
    if tool_id:
        return crud.robot_arm_sequence.get_all_by(db, obj_in={"tool_id": tool_id})
    return crud.robot_arm_sequence.get_all(db)


@router.post("/sequences", response_model=schemas.RobotArmSequence)
def create_robot_arm_sequence(
    sequence: schemas.RobotArmSequenceCreate, db: Session = Depends(get_db)
) -> t.Any:
    return crud.robot_arm_sequence.create(db, obj_in=sequence)


@router.put("/sequences/{sequence_id}", response_model=schemas.RobotArmSequence)
def update_robot_arm_sequence(
    sequence_id: int,
    sequence: schemas.RobotArmSequenceUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    db_sequence = crud.robot_arm_sequence.get(db, id=sequence_id)
    if not db_sequence:
        raise HTTPException(status_code=404, detail="Sequence not found")
    return crud.robot_arm_sequence.update(db, db_obj=db_sequence, obj_in=sequence)


@router.delete("/sequences/{sequence_id}", response_model=schemas.RobotArmSequence)
def delete_robot_arm_sequence(sequence_id: int, db: Session = Depends(get_db)) -> t.Any:
    sequence = crud.robot_arm_sequence.get(db, id=sequence_id)
    if not sequence:
        raise HTTPException(status_code=404, detail="Sequence not found")
    return crud.robot_arm_sequence.remove(db, id=sequence_id)


# Robot Arm Motion Profiles
@router.get("/motion-profiles", response_model=list[schemas.RobotArmMotionProfile])
def get_robot_arm_motion_profiles(
    db: Session = Depends(get_db), tool_id: Optional[int] = None
) -> t.Any:
    if tool_id:
        return crud.robot_arm_motion_profile.get_all_by(db, obj_in={"tool_id": tool_id})
    return crud.robot_arm_motion_profile.get_all(db)


@router.post("/motion-profiles", response_model=schemas.RobotArmMotionProfile)
def create_robot_arm_motion_profile(
    profile: schemas.RobotArmMotionProfileCreate, db: Session = Depends(get_db)
) -> t.Any:
    return crud.robot_arm_motion_profile.create(db, obj_in=profile)


@router.put("/motion-profiles/{profile_id}", response_model=schemas.RobotArmMotionProfile)
def update_robot_arm_motion_profile(
    profile_id: int,
    profile: schemas.RobotArmMotionProfileUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    db_profile = crud.robot_arm_motion_profile.get(db, id=profile_id)
    if not db_profile:
        raise HTTPException(status_code=404, detail="Motion profile not found")
    return crud.robot_arm_motion_profile.update(db, db_obj=db_profile, obj_in=profile)


@router.delete("/motion-profiles/{profile_id}", response_model=schemas.RobotArmMotionProfile)
def delete_robot_arm_motion_profile(
    profile_id: int, db: Session = Depends(get_db)
) -> t.Any:
    profile = crud.robot_arm_motion_profile.get(db, id=profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Motion profile not found")
    return crud.robot_arm_motion_profile.remove(db, id=profile_id)


# Robot Arm Grip Parameters
@router.get("/grip-params", response_model=list[schemas.RobotArmGripParams])
def get_robot_arm_grip_params(
    db: Session = Depends(get_db), tool_id: Optional[int] = None
) -> t.Any:
    if tool_id:
        return crud.robot_arm_grip_params.get_all_by(db, obj_in={"tool_id": tool_id})
    return crud.robot_arm_grip_params.get_all(db)


@router.post("/grip-params", response_model=schemas.RobotArmGripParams)
def create_robot_arm_grip_params(
    params: schemas.RobotArmGripParamsCreate, db: Session = Depends(get_db)
) -> t.Any:
    return crud.robot_arm_grip_params.create(db, obj_in=params)


@router.put("/grip-params/{params_id}", response_model=schemas.RobotArmGripParams)
def update_robot_arm_grip_params(
    params_id: int,
    params: schemas.RobotArmGripParamsUpdate,
    db: Session = Depends(get_db),
) -> t.Any:
    db_params = crud.robot_arm_grip_params.get(db, id=params_id)
    if not db_params:
        raise HTTPException(status_code=404, detail="Grip parameters not found")
    return crud.robot_arm_grip_params.update(db, db_obj=db_params, obj_in=params)


@router.delete("/grip-params/{params_id}", response_model=schemas.RobotArmGripParams)
def delete_robot_arm_grip_params(
    params_id: int, db: Session = Depends(get_db)
) -> t.Any:
    params = crud.robot_arm_grip_params.get(db, id=params_id)
    if not params:
        raise HTTPException(status_code=404, detail="Grip parameters not found")
    return crud.robot_arm_grip_params.remove(db, id=params_id)


# Waypoints
@router.get("/waypoints/{tool_id}", response_model=schemas.RobotArmWaypoints)
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
        "tool_name": tool.name,
        "name": f"Waypoints for Tool {tool_id}",
        "locations": locations,
        "sequences": sequences,
        "motion_profiles": motion_profiles,
        "grip_params": grip_params,
    }


@router.post("/waypoints/upload")
async def upload_waypoints(
    file: UploadFile = File(...),
    tool_id: int = Form(...),
    db: Session = Depends(get_db),
):
    from db.waypoint_handler import handle_waypoint_upload
    return await handle_waypoint_upload(file, tool_id, db)