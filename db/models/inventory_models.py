from sqlalchemy import Column, ForeignKey, Integer, String, JSON, Date,Boolean,Float, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from .db_session import Base
from sqlalchemy.ext.declarative import declared_attr
import datetime

class TimestampMixin:
    @declared_attr
    def created_at(cls) -> Column:
        return Column(DateTime, default=datetime.datetime.now())
    @declared_attr
    def updated_at(cls) -> Column:
        return Column(DateTime, default=datetime.datetime.now(), onupdate=datetime.datetime.now())

class Workcell(Base, TimestampMixin):
    __tablename__ = "workcells"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    location = Column(String, nullable=True)
    description = Column(String, nullable=True) 
    tools = relationship("Tool", back_populates="workcell", cascade="all, delete-orphan")
    
    __table_args__ = (
        CheckConstraint("name <> ''", name="check_non_empty_name"),
    )

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
    workcell_id = Column(String, ForeignKey("workcells.id"))
    workcell = relationship("Workcell", back_populates="tools")
    nests = relationship("Nest", back_populates="tool")
    robot_arm_locations = relationship("RobotArmLocation", back_populates="tool")
    robot_arm_nests = relationship("RobotArmNest", back_populates="tool")
    robot_arm_sequences = relationship("RobotArmSequence", back_populates="tool")
    robot_arm_motion_profiles = relationship("RobotArmMotionProfile", back_populates="tool")
    robot_arm_grip_params = relationship("RobotArmGripParams", back_populates="tool")

    __table_args__ = (
        CheckConstraint("name <> ''", name="check_non_empty_name"),
    )

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

class Labware(Base, TimestampMixin):
    __tablename__ = "labware"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    image_url = Column(String, nullable=True)
    description = Column(String, nullable=False)
    number_of_rows = Column(Integer, nullable=False)
    number_of_columns = Column(Integer, nullable=False)
    z_offset = Column(Float, nullable=False)
    width = Column(Float, nullable=False)
    height = Column(Float, nullable=False)
    plate_lid_offset = Column(Float, nullable=True)
    lid_offset = Column(Float, nullable=True)
    stack_height = Column(Float, nullable=True)
    has_lid = Column(Boolean, nullable=True) 

    __table_args__ = (
        CheckConstraint("name <> ''", name="check_non_empty_name"),
    )
    
class Script(Base, TimestampMixin):
    __tablename__ = "scripts"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=False)
    content = Column(String, nullable=False)
    language = Column(String, nullable=False)
    is_blocking = Column(Boolean, nullable=False) 

    
class AppSettings(Base, TimestampMixin):
    __tablename__ = "app_settings"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    value = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False)

class RobotArmLocation(Base, TimestampMixin):
    __tablename__ = "robot_arm_locations"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    location_type = Column(String, nullable=False)  # 'j' for joint or 'c' for cartesian
    j1 = Column(Float, nullable=True)
    j2 = Column(Float, nullable=True)
    j3 = Column(Float, nullable=True)
    j4 = Column(Float, nullable=True)
    j5 = Column(Float, nullable=True)
    j6 = Column(Float, nullable=True)
    tool_id = Column(Integer, ForeignKey("tools.id"))
    tool = relationship("Tool", back_populates="robot_arm_locations")
    dependent_nests = relationship("RobotArmNest", 
                                 back_populates="safe_location",
                                 cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("name <> ''", name="check_non_empty_name"),
    )

class RobotArmNest(Base, TimestampMixin):
    __tablename__ = "robot_arm_nests"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    orientation = Column(String, nullable=False)  # 'portrait' or 'landscape'
    location_type = Column(String, nullable=False)  # 'j' for joint or 'c' for cartesian
    j1 = Column(Float, nullable=True)
    j2 = Column(Float, nullable=True)
    j3 = Column(Float, nullable=True)
    j4 = Column(Float, nullable=True)
    j5 = Column(Float, nullable=True)
    j6 = Column(Float, nullable=True)
    safe_location_id = Column(Integer, ForeignKey("robot_arm_locations.id"))
    tool_id = Column(Integer, ForeignKey("tools.id"))
    tool = relationship("Tool", back_populates="robot_arm_nests")
    safe_location = relationship("RobotArmLocation")

    __table_args__ = (
        CheckConstraint("name <> ''", name="check_non_empty_name"),
    )

class RobotArmSequence(Base, TimestampMixin):
    __tablename__ = "robot_arm_sequences"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    commands = Column(JSON, nullable=False)  # List of commands and their parameters
    tool_id = Column(Integer, ForeignKey("tools.id"))
    tool = relationship("Tool", back_populates="robot_arm_sequences")

    __table_args__ = (
        CheckConstraint("name <> ''", name="check_non_empty_name"),
    )

class RobotArmMotionProfile(Base, TimestampMixin):
    __tablename__ = "robot_arm_motion_profiles"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    profile_id = Column(Integer, nullable=False)  # This is the ID used by the robot
    speed = Column(Float, nullable=False)
    speed2 = Column(Float, nullable=False)
    acceleration = Column(Float, nullable=False)
    deceleration = Column(Float, nullable=False)
    accel_ramp = Column(Float, nullable=False)
    decel_ramp = Column(Float, nullable=False)
    inrange = Column(Float, nullable=False)
    straight = Column(Integer, nullable=False)
    tool_id = Column(Integer, ForeignKey("tools.id"))
    tool = relationship("Tool", back_populates="robot_arm_motion_profiles")

    __table_args__ = (
        CheckConstraint("name <> ''", name="check_non_empty_name"),
    )

class RobotArmGripParams(Base, TimestampMixin):
    __tablename__ = "robot_arm_grip_params"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    width = Column(Integer, nullable=False)
    speed = Column(Integer, nullable=False)
    force = Column(Integer, nullable=False)
    tool_id = Column(Integer, ForeignKey("tools.id"))
    tool = relationship("Tool", back_populates="robot_arm_grip_params")

    __table_args__ = (
        CheckConstraint("name <> ''", name="check_non_empty_name"),
    )