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


def initialize_database(db: Session) -> None:
    """Initialize database with default data."""
    create_default_labware(db)
    # Add other initialization functions here as needed
