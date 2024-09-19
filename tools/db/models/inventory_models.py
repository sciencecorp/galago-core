from sqlalchemy import Column, ForeignKey, Integer, String, JSON, Date, Float, func, DateTime
from sqlalchemy.orm import relationship
from tools.db.models.db import Base


class TimestampMixin:
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class Workcell(Base, TimestampMixin):
    __tablename__ = "workcells"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    instruments = relationship("Instrument", back_populates="workcell")


class Instrument(Base, TimestampMixin):
    __tablename__ = "instruments"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    workcell_id = Column(Integer, ForeignKey("workcells.id"))
    workcell = relationship("Workcell", back_populates="instruments")
    nests = relationship("Nest", back_populates="instrument")


class Nest(Base, TimestampMixin):
    __tablename__ = "nests"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    row = Column(Integer)
    column = Column(Integer)
    instrument_id = Column(Integer, ForeignKey("instruments.id"))
    instrument = relationship("Instrument", back_populates="nests")
    plate = relationship("Plate", back_populates="nest", uselist=False)


class Plate(Base, TimestampMixin):
    __tablename__ = "plates"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=True)
    barcode = Column(String)
    plate_type = Column(String)
    nest_id = Column(Integer, ForeignKey("nests.id"), nullable=True)
    nest = relationship("Nest", back_populates="plate")
    wells = relationship("Well", back_populates="plate")


class Well(Base, TimestampMixin):
    __tablename__ = "wells"
    id = Column(Integer, primary_key=True)
    row = Column(String)
    column = Column(Integer)

    plate_id = Column(Integer, ForeignKey("plates.id"))
    plate = relationship("Plate", back_populates="wells")
    reagents = relationship("Reagent", back_populates="well")

class Reagent(Base, TimestampMixin):
    __tablename__ = "reagents"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    expiration_date = Column(Date)
    volume = Column(Float)

    well_id = Column(Integer, ForeignKey("wells.id"))
    well = relationship("Well", back_populates="reagents")

class VariableType(Base, TimestampMixin):
    __tablename__= "variable_types"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)

class Variable(Base):
    __tablename__ = "variables"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    value = Column(JSON)
    type = Column(String)


if __name__ == "__main__":
    from sqlalchemy import create_engine
    from tools.app_config import Config

    config = Config()
    config.load_app_config()
    engine = create_engine(config.inventory_db, connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
