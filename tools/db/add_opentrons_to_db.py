from sqlalchemy.orm import Session
import tools.db.crud as crud
import tools.db.schemas as schemas
from tools.db.models.db import SessionLocal


def instantiate_example_data(db_session: Session) -> None:
    # Create workcells

    cell_culture_workcell = crud.workcell.get_by(
        db_session, obj_in={"name":"Cell Foundry Workcell"}
    )
    if not cell_culture_workcell:
        raise ValueError("No Cell Foundry Workcell instantiated yet")
    # cell foundry Workcell
    # Add instruments to the database
    instruments = [
        schemas.InstrumentCreate(
            name="opentrons2_2", workcell_id=cell_culture_workcell.id
        ),
    ]
       
    instrument_models = {}
    for instrument in instruments:
        instrument_models[instrument.name] = crud.instrument.create(
            db_session, obj_in=instrument
        )

 
     # Create nests for opentrons 2
    for column in [1, 2, 3]:
        for row in [1, 2, 3, 4]:
            crud.nest.create(
                db_session,
                obj_in=schemas.NestCreate(
                    name=f"CF_ot2_2_{row}_{column}_nest",
                    row=row,
                    column=column,
                    instrument_id=instrument_models["opentrons2_2"].id,
                ),
            )


if __name__ == "__main__":
    db_session = SessionLocal()
    try:
        instantiate_example_data(db_session)
    finally:
        db_session.close()
