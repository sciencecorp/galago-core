import logging
from sqlalchemy.orm import Session
from db import crud
from db import schemas


def create_default_labware(db: Session) -> None:
    """Create default labware if it doesn't exist."""
    try:
        default_labware = crud.labware.get_by(db, obj_in={"name": "default"})
        if not default_labware:
            crud.labware.create(
                db,
                obj_in=schemas.LabwareCreate(
                    name="default",
                    description="Default labware",
                    number_of_rows=2,
                    number_of_columns=3,
                    z_offset=0,
                    width=125,
                    height=14,
                    plate_lid_offset=0,
                    lid_offset=0,
                    stack_height=0,
                    has_lid=False,
                ),
            )
            logging.info("Created default labware")
    except Exception as e:
        logging.error(f"Error creating default labware: {str(e)}")
        raise


def create_default_motion_profile(db: Session, tool_id: int) -> None:
    """Create default motion profile if it doesn't exist."""
    try:
        default_profile = crud.robot_arm_motion_profile.get_by(db, obj_in={"name": "Default"})
        if not default_profile:
            crud.robot_arm_motion_profile.create(
                db,
                obj_in=schemas.RobotArmMotionProfileCreate(
                    name="Default",
                    profile_id=1,
                    speed=50,
                    speed2=50,
                    acceleration=50,
                    deceleration=50,
                    accel_ramp=0.2,
                    decel_ramp=0.2,
                    inrange=1,
                    straight=0,
                    tool_id=tool_id,
                ),
            )
            logging.info("Created default motion profile")
    except Exception as e:
        logging.error(f"Error creating default motion profile: {str(e)}")
        raise


def create_default_grip_params(db: Session, tool_id: int) -> None:
    """Create default grip parameters if they don't exist."""
    try:
        # Portrait grip parameters
        portrait_params = crud.robot_arm_grip_params.get_by(db, obj_in={"name": "Portrait"})
        if not portrait_params:
            crud.robot_arm_grip_params.create(
                db,
                obj_in=schemas.RobotArmGripParamsCreate(
                    name="Portrait",
                    width=86,  # Standard portrait width
                    speed=10,
                    force=15,
                    tool_id=tool_id,
                ),
            )
            logging.info("Created portrait grip parameters")

        # Landscape grip parameters
        landscape_params = crud.robot_arm_grip_params.get_by(db, obj_in={"name": "Landscape"})
        if not landscape_params:
            crud.robot_arm_grip_params.create(
                db,
                obj_in=schemas.RobotArmGripParamsCreate(
                    name="Landscape",
                    width=122,  # Standard landscape width
                    speed=10,
                    force=15,
                    tool_id=tool_id,
                ),
            )
            logging.info("Created landscape grip parameters")
    except Exception as e:
        logging.error(f"Error creating default grip parameters: {str(e)}")
        raise


def initialize_database(db: Session) -> None:
    """Initialize database with default data."""
    create_default_labware(db)
    
    # Get all PF400 tools
    pf400_tools = crud.tool.get_all_by(db, obj_in={"type": "pf400"})
    
    # Create default profiles and parameters for each PF400
    for tool in pf400_tools:
        create_default_motion_profile(db, tool.id)
        create_default_grip_params(db, tool.id)
        logging.info(f"Created default profiles for PF400 tool: {tool.name}")
