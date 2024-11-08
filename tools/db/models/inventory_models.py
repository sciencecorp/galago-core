from sqlalchemy import Column, ForeignKey, Integer, String, JSON, Date,Boolean,Float, func, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from tools.db.models.db import Base
from sqlalchemy.ext.declarative import declared_attr
import datetime 

class TimestampMixin:
    @declared_attr
    def created_at(cls):
        return Column(DateTime, default=datetime.datetime.now())
    @declared_attr
    def updated_at(cls):
        return Column(DateTime, default=datetime.datetime.now(), onupdate=datetime.datetime.now())


class Workcell(Base, TimestampMixin):
    __tablename__ = "workcells"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    host = Column(String, nullable=False)
    port = Column(Integer, nullable=False)
    tools = relationship("Tool", back_populates="workcell")

class Tool(Base, TimestampMixin):
    __tablename__ = "tools"
    id = Column(Integer, primary_key=True)
    type = Column(String, nullable=False)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    ip = Column(String, nullable=False)
    port = Column(Integer, nullable=False)
    config = Column(JSON, nullable=True) 
    simulated = Column(Boolean, default=False)
    workcell_id = Column(String, ForeignKey("workcells.id"))
    workcell = relationship("Workcell", back_populates="tools")
    nests = relationship("Nest", back_populates="tool")

class Nest(Base, TimestampMixin):
    __tablename__ = "nests"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    row = Column(Integer)
    column = Column(Integer)
    tool_id = Column(Integer, ForeignKey("tools.id"))
    tool = relationship("Tool", back_populates="nests")
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

class Variable(Base,TimestampMixin):
    __tablename__ = "variables"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    value = Column(String , nullable=False)
    type = Column(String)

    __table_args__ = (
        CheckConstraint("name <> ''", name="check_non_empty_name"),
    )

if __name__ == "__main__":
    from sqlalchemy import create_engine
    from tools.app_config import Config

    config = Config()
    config.load_app_config()
    engine = create_engine(config.inventory_db, connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
