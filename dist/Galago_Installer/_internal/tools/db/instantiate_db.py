from sqlalchemy.orm import Session
import tools.db.crud as crud
import tools.db.schemas as schemas
from tools.db.models.db import SessionLocal


def create_matching_wells(db: Session, plate_id: int, plate_type: str) -> None:
    if plate_type == "6 well":
        for row in ["A", "B"]:
            for column in [1, 2, 3]:
                crud.well.create(
                    db,
                    obj_in=schemas.WellCreate(
                        plate_id=plate_id, row=row, column=column
                    ),
                )
    elif plate_type ==  "12 well":
        for row in ["A", "B", "C"]:
            for column in [1, 2, 3, 4]:
                crud.well.create(
                    db,
                    obj_in=schemas.WellCreate(
                        plate_id=plate_id, row=row, column=column
                    ),
                )
    elif plate_type == "24 well":
        for row in ["A", "B", "C", "D"]:
            for column in [1, 2, 3, 4, 5, 6]:
                crud.well.create(
                    db,
                    obj_in=schemas.WellCreate(
                        plate_id=plate_id, row=row, column=column
                    ),
                )
    elif plate_type == "96 well":
        for row in ["A", "B", "C", "D", "E", "F", "G", "H"]:
            for column in range(1, 13):
                crud.well.create(
                    db,
                    obj_in=schemas.WellCreate(
                        plate_id=plate_id, row=row, column=column
                    ),
                )
    else:
        pass


def instantiate_example_data(db_session: Session) -> None:
    # Create workcells
    biolab_workcell = crud.workcell.create(
        db_session, obj_in=schemas.WorkcellCreate(name="Biolab Workcell")
    )
    ultralight_workcell = crud.workcell.create(
        db_session, obj_in=schemas.WorkcellCreate(name="Ultralight")
    )

    baymax_workcell = crud.workcell.create(
        db_session, obj_in=schemas.WorkcellCreate(name="Baymax")
    )

    # BIOLAB Workcell
    # Add instruments to the database
    instruments = [
        schemas.InstrumentCreate(name="fridge", workcell_id=biolab_workcell.id),
        schemas.InstrumentCreate(name="hotel", workcell_id=biolab_workcell.id),
        schemas.InstrumentCreate(name="regrip station", workcell_id=biolab_workcell.id),
        schemas.InstrumentCreate(name="cytation", workcell_id=biolab_workcell.id),
        schemas.InstrumentCreate(name="opentrons 1", workcell_id=biolab_workcell.id),
        schemas.InstrumentCreate(name="opentrons 2", workcell_id=biolab_workcell.id),
    ]
    instrument_models = {}
    for instrument in instruments:
        instrument_models[instrument.name] = crud.instrument.create(
            db_session, obj_in=instrument
        )

    # Create nests for fridge
    fridge_nests = [
        schemas.NestCreate(
            name=f"fridge_{row}_nest",
            row=row,
            column=1,
            instrument_id=instrument_models["fridge"].id,
        )
        for row in range(1, 9)
    ]
    for nest in fridge_nests:
        fridge_nest = crud.nest.create(db_session, obj_in=nest)

    # Create nests for hotel
    for column in [1, 2]:
        for row in range(1, 9):
            crud.nest.create(
                db_session,
                obj_in=schemas.NestCreate(
                    name=f"hotel_{row}_{column}_nest",
                    row=row,
                    column=column,
                    instrument_id=instrument_models["hotel"].id,
                ),
            )

    # Create nests for regrip station
    crud.nest.create(
        db_session,
        obj_in=schemas.NestCreate(
            name="regrip_nest",
            row=1,
            column=1,
            instrument_id=instrument_models["regrip station"].id,
        ),
    )

    # Create nests for cytation 1
    crud.nest.create(
        db_session,
        obj_in=schemas.NestCreate(
            name="cytation_nest",
            row=1,
            column=1,
            instrument_id=instrument_models["cytation"].id,
        ),
    )

    # Create nests for opentrons 1 Histo
    for column in [1, 2, 3]:
        for row in [1, 2, 3, 4]:
            crud.nest.create(
                db_session,
                obj_in=schemas.NestCreate(
                    name=f"histo_ot2_{row}_{column}_nest",
                    row=row,
                    column=column,
                    instrument_id=instrument_models["opentrons 1"].id,
                ),
            )

    # Create nests for opentrons 2 Mol Bio
    for column in [1, 2, 3]:
        for row in [1, 2, 3, 4]:
            crud.nest.create(
                db_session,
                obj_in=schemas.NestCreate(
                    name=f"molbio_ot2_{row}_{column}_nest",
                    row=row,
                    column=column,
                    instrument_id=instrument_models["opentrons 2"].id,
                ),
            )

    # Create plates
    plate = crud.plate.create(
        db_session,
        obj_in=schemas.PlateCreate(
            barcode="000000000001",
            nest_id=fridge_nest.id,
            plate_type="96 well",
            name="mTESR plate",
        ),
    )
    create_matching_wells(db_session, plate_id=plate.id, plate_type="96 well")
    plate = crud.plate.create(
        db_session,
        obj_in=schemas.PlateCreate(
            barcode="000000000002",
            nest_id=fridge_nest.id - 2,
            plate_type="6 well",
            name="ips15 plate",
        ),
    )
    create_matching_wells(db_session, plate_id=plate.id, plate_type="6 well")
    plate = crud.plate.create(
        db_session,
        obj_in=schemas.PlateCreate(
            barcode="000000000003", nest_id=18, plate_type="24 well", name="HEK plate"
        ),
    )
    create_matching_wells(db_session, plate_id=plate.id, plate_type="24 well")
    plate = crud.plate.create(
        db_session,
        obj_in=schemas.PlateCreate(
            barcode="000000000004", plate_type="6 well", name="ip11NA plate"
        ),
    )
    create_matching_wells(db_session, plate_id=plate.id, plate_type="6 well")

    # Ultralight Workcell
    # Add instruments to the database
    instruments = [
        schemas.InstrumentCreate(name="Hotel 1", workcell_id=ultralight_workcell.id),
        schemas.InstrumentCreate(name="Hotel 2", workcell_id=ultralight_workcell.id),
        schemas.InstrumentCreate(
            name="Regrip Station", workcell_id=ultralight_workcell.id
        ),
        schemas.InstrumentCreate(
            name="Cytation 1", workcell_id=ultralight_workcell.id
        ),
        schemas.InstrumentCreate(
            name="OT2", workcell_id=ultralight_workcell.id
        ),
        schemas.InstrumentCreate(
            name="Liconic", workcell_id=ultralight_workcell.id
        ),
        schemas.InstrumentCreate(
            name="beesure_1", workcell_id=ultralight_workcell.id
        )
    ]
    instrument_models = {}
    for instrument in instruments:
        instrument_models[instrument.name] = crud.instrument.create(
            db_session, obj_in=instrument
        )

    # Create nests for hotel 1
    for column in [1]:
        for row in range(0, 10):
            crud.nest.create(
                db_session,
                obj_in=schemas.NestCreate(
                    name=f"r1:l{row+1}",
                    row=row+1,
                    column=column,
                    instrument_id=instrument_models["Hotel 1"].id,
                ),
            )

    # Create nests for hotel 2
    for column in [1]:
        for row in range(0, 10):
            crud.nest.create(
                db_session,
                obj_in=schemas.NestCreate(
                    name=f"r2:l{row+1}",
                    row=row+1,
                    column=column,
                    instrument_id=instrument_models["Hotel 2"].id,
                ),
            )

    # Create nests for regrip station
    crud.nest.create(
        db_session,
        obj_in=schemas.NestCreate(
            name="regrip_nest",
            row=1,
            column=1,
            instrument_id=instrument_models["Regrip Station"].id,
        ),
    )
    #Create nest fot beesure 1
    crud.nest.create(
        db_session,
        obj_in=schemas.NestCreate(
            name="besure_nest",
            row=1,
            column=1,
            instrument_id=instrument_models["beesure_1"].id,
        ),
    )

    # Create nests for cytation 1
    crud.nest.create(
        db_session,
        obj_in=schemas.NestCreate(
            name="cytation_nest",
            row=1,
            column=1,
            instrument_id=instrument_models["Cytation 1"].id,
        ),
    )

    # Create nests for opentrons 1
    for column in [1, 2, 3]:
        for row in [1, 2, 3, 4]:
            crud.nest.create(
                db_session,
                obj_in=schemas.NestCreate(
                    name=f"cf_ot2_1_{row}_{column}_nest",
                    row=row,
                    column=column,
                    instrument_id=instrument_models["OT2"].id,
                ),
            )

    # Create nests for liconic 1
    for column in [1, 2, 3, 4, 5, 6, 7, 8,9]:
        for row in [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]:
            crud.nest.create(
                db_session,
                obj_in=schemas.NestCreate(
                    name=f"liconic_{row}_{column}_nest",
                    row=row,
                    column=column,
                    instrument_id=instrument_models["Liconic"].id,
                ),
            )
            
    # baymax Workcell
    # Add instruments to the database
    instruments = [
        schemas.InstrumentCreate(name="Hotel 1", workcell_id=baymax_workcell.id),
        schemas.InstrumentCreate(name="Hotel 2", workcell_id=baymax_workcell.id),
        schemas.InstrumentCreate(
            name="Regrip Station", workcell_id=baymax_workcell.id
        ),
        schemas.InstrumentCreate(
            name="Cytation 5", workcell_id=baymax_workcell.id
        ),
        schemas.InstrumentCreate(
            name="OT2", workcell_id=baymax_workcell.id
        ),
        schemas.InstrumentCreate(
            name="Liconic", workcell_id=baymax_workcell.id
        ),
        schemas.InstrumentCreate(
            name="Bravo", workcell_id=baymax_workcell.id
        ),
        schemas.InstrumentCreate(
            name="xpeel", workcell_id=baymax_workcell.id
        ),
        schemas.InstrumentCreate(
            name="alps3000", workcell_id=baymax_workcell.id
        ),

    ]
    instrument_models = {}
    for instrument in instruments:
        instrument_models[instrument.name] = crud.instrument.create(
            db_session, obj_in=instrument
        )

   # Create nests for hotel 1
    for column in [1]:
        for row in range(0, 10):
            crud.nest.create(
                db_session,
                obj_in=schemas.NestCreate(
                    name=f"r1:l{row+1}",
                    row=row+1,
                    column=column,
                    instrument_id=instrument_models["Hotel 1"].id,
                ),
            )

    # Create nests for hotel 2
    for column in [1]:
        for row in range(0, 10):
            crud.nest.create(
                db_session,
                obj_in=schemas.NestCreate(
                    name=f"r2:l{row+1}",
                    row=row+1,
                    column=column,
                    instrument_id=instrument_models["Hotel 2"].id,
                ),
            )

    # Create nests for regrip station
    crud.nest.create(
        db_session,
        obj_in=schemas.NestCreate(
            name="regrip_nest",
            row=1,
            column=1,
            instrument_id=instrument_models["Regrip Station"].id,
        ),
    )

    # Create nests for cytation 1
    crud.nest.create(
        db_session,
        obj_in=schemas.NestCreate(
            name="cytation_nest",
            row=1,
            column=1,
            instrument_id=instrument_models["Cytation 5"].id,
        ),
    )

    # Create nests for opentrons 1
    for column in [1, 2, 3]:
        for row in [1, 2, 3, 4]:
            crud.nest.create(
                db_session,
                obj_in=schemas.NestCreate(
                    name=f"cf_ot2_1_{row}_{column}_nest",
                    row=row,
                    column=column,
                    instrument_id=instrument_models["OT2"].id,
                ),
            )
    # Create nests for liconic 1
    #Stacks 1-4 only have even number shelves. 
    for column in [1, 2, 3, 4,5,6,7,8,9,10]:
        for row in [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22,24,26,28]:
            crud.nest.create(
                db_session,
                obj_in=schemas.NestCreate(
                    name=f"liconic_{row}_{column}_nest",
                    row=row,
                    column=column,
                    instrument_id=instrument_models["Liconic"].id,
                ),
            )

    # #Stack 5 has all 1-22 
    # for row in range(0, 22):
    #     crud.nest.create(
    #         db_session,
    #         obj_in=schemas.NestCreate(
    #             name=f"liconic_{row+1}_{5}_nest",
    #             row=row+1,
    #             column=5,
    #             instrument_id=instrument_models["Liconic"].id,
    #         ),
    #     )

    # Create nests for Bravo 1
    for column in [1, 2, 3]:
        for row in [1, 2, 3]:
            crud.nest.create(
                db_session,
                obj_in=schemas.NestCreate(
                    name=f"bravo_{row}_{column}_nest",
                    row=row,
                    column=column,
                    instrument_id=instrument_models["Bravo"].id,
                ),
            )
    # Create nests for XPeel 1
    crud.nest.create(
        db_session,
        obj_in=schemas.NestCreate(
            name="xPeel",
            row=1,
            column=1,
            instrument_id=instrument_models["xpeel"].id,
        ),
    )

    # Create nests for XPeel 1
    crud.nest.create(
        db_session,
        obj_in=schemas.NestCreate(
            name="Alps3000",
            row=1,
            column=1,
            instrument_id=instrument_models["alps3000"].id,
        ),
    )
    

if __name__ == "__main__":
    db_session = SessionLocal()
    try:
        instantiate_example_data(db_session)
    finally:
        db_session.close()
