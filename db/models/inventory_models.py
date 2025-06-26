from __future__ import annotations
import enum
from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    String,
    JSON,
    Boolean,
    Float,
    CheckConstraint,
    Enum as SQLEnum,
    Date,
    UniqueConstraint
)
from sqlalchemy.orm import relationship, RelationshipProperty
from sqlalchemy.sql import func
from typing import List, Optional
from .db_session import Base
from .utils import TimestampMixin


class Workcell(Base, TimestampMixin):
    __tablename__ = "workcells"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    location = Column(String, nullable=True)
    description = Column(String, nullable=True)
    tools: RelationshipProperty["Tool"] = relationship(
        "Tool", back_populates="workcell", cascade="all, delete-orphan"
    )
    protocols: RelationshipProperty[List["Protocol"]] = relationship(
        "Protocol", back_populates="workcell", cascade="all, delete-orphan"
    )
    hotels: RelationshipProperty[List["Hotel"]] = relationship(
        "Hotel", back_populates="workcell", cascade="all, delete-orphan"
    )

    __table_args__ = (CheckConstraint("name <> ''", name="check_non_empty_name"),)


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
    workcell: RelationshipProperty[Optional["Workcell"]] = relationship(
        "Workcell", back_populates="tools"
    )
    nests: RelationshipProperty[List["Nest"]] = relationship(
        "Nest", back_populates="tool"
    )
    robot_arm_locations: RelationshipProperty[List["RobotArmLocation"]] = relationship(
        "RobotArmLocation", back_populates="tool", cascade="all, delete-orphan"
    )
    robot_arm_sequences: RelationshipProperty[List["RobotArmSequence"]] = relationship(
        "RobotArmSequence", back_populates="tool"
    )
    robot_arm_motion_profiles: RelationshipProperty[
        List["RobotArmMotionProfile"]
    ] = relationship("RobotArmMotionProfile", back_populates="tool")
    robot_arm_grip_params: RelationshipProperty[
        List["RobotArmGripParams"]
    ] = relationship("RobotArmGripParams", back_populates="tool")

    __table_args__ = (CheckConstraint("name <> ''", name="check_non_empty_name"),)


class Hotel(Base, TimestampMixin):
    __tablename__ = "hotels"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    rows = Column(Integer, nullable=False)
    columns = Column(Integer, nullable=False)
    workcell_id = Column(Integer, ForeignKey("workcells.id"))

    # Relationships
    workcell: RelationshipProperty[Optional["Workcell"]] = relationship(
        "Workcell", back_populates="hotels"
    )
    nests: RelationshipProperty[List["Nest"]] = relationship(
        "Nest", back_populates="hotel"
    )

    __table_args__ = (CheckConstraint("name <> ''", name="check_non_empty_name"),)


class NestStatus(str, enum.Enum):
    empty = "empty"
    occupied = "occupied"
    reserved = "reserved"
    error = "error"


class PlateStatus(str, enum.Enum):
    stored = "stored"
    checked_out = "checked_out"
    completed = "completed"
    disposed = "disposed"


class PlateNestAction(str, enum.Enum):
    check_in = "check_in"
    check_out = "check_out"
    transfer = "transfer"


class Nest(Base, TimestampMixin):
    __tablename__ = "nests"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    row = Column(Integer)
    column = Column(Integer)
    tool_id = Column(Integer, ForeignKey("tools.id"), nullable=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True)
    status = Column(SQLEnum(NestStatus), default=NestStatus.empty)

    # Relationships
    tool: RelationshipProperty[Optional["Tool"]] = relationship(
        "Tool", back_populates="nests"
    )
    hotel: RelationshipProperty[Optional["Hotel"]] = relationship(
        "Hotel", back_populates="nests"
    )
    plate_history: RelationshipProperty[List["PlateNestHistory"]] = relationship(
        "PlateNestHistory", back_populates="nest"
    )


class Plate(Base, TimestampMixin):
    __tablename__ = "plates"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=True)
    barcode = Column(String)
    plate_type = Column(String)
    nest_id = Column(Integer, ForeignKey("nests.id"), nullable=True)
    status = Column(SQLEnum(PlateStatus), default=PlateStatus.stored)

    # Relationships
    current_nest: RelationshipProperty[Optional["Nest"]] = relationship(
        "Nest", foreign_keys=[nest_id], uselist=False
    )
    nest_history: RelationshipProperty[List["PlateNestHistory"]] = relationship(
        "PlateNestHistory", back_populates="plate"
    )
    wells: RelationshipProperty[List["Well"]] = relationship(
        "Well", back_populates="plate"
    )


class PlateNestHistory(Base, TimestampMixin):
    __tablename__ = "plate_nest_history"
    id = Column(Integer, primary_key=True)
    plate_id = Column(Integer, ForeignKey("plates.id"))
    nest_id = Column(Integer, ForeignKey("nests.id"))
    action = Column(SQLEnum(PlateNestAction))
    timestamp = Column(Date, server_default=func.now())

    # Relationships
    plate: RelationshipProperty["Plate"] = relationship(
        "Plate", back_populates="nest_history"
    )
    nest: RelationshipProperty["Nest"] = relationship(
        "Nest", back_populates="plate_history"
    )


class Well(Base, TimestampMixin):
    __tablename__ = "wells"
    id = Column(Integer, primary_key=True)
    row = Column(String)
    column = Column(Integer)
    plate_id = Column(Integer, ForeignKey("plates.id"))

    # Relationships
    plate: RelationshipProperty["Plate"] = relationship("Plate", back_populates="wells")
    reagents: RelationshipProperty[List["Reagent"]] = relationship(
        "Reagent", back_populates="well"
    )


class Reagent(Base, TimestampMixin):
    __tablename__ = "reagents"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    expiration_date = Column(Date)
    volume = Column(Float)
    well_id = Column(Integer, ForeignKey("wells.id"))

    # Relationships
    well: RelationshipProperty["Well"] = relationship("Well", back_populates="reagents")


class VariableType(Base, TimestampMixin):
    __tablename__ = "variable_types"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)


class Variable(Base, TimestampMixin):
    __tablename__ = "variables"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    value = Column(String, nullable=False)
    type = Column(String)

    __table_args__ = (CheckConstraint("name <> ''", name="check_non_empty_name"),)


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

    __table_args__ = (CheckConstraint("name <> ''", name="check_non_empty_name"),)


class ScriptFolder(Base, TimestampMixin):
    __tablename__ = "script_folders"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    parent_id = Column(Integer, ForeignKey("script_folders.id"), nullable=True)
    description = Column(String, nullable=True)

    # Relationships
    parent: RelationshipProperty[Optional["ScriptFolder"]] = relationship(
        "ScriptFolder", remote_side=[id], backref="subfolders"
    )
    scripts: RelationshipProperty[List["Script"]] = relationship(
        "Script", back_populates="folder"
    )


class Script(Base, TimestampMixin):
    __tablename__ = "scripts"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=False)
    content = Column(String, nullable=False)
    language = Column(String, nullable=False)
    is_blocking = Column(Boolean, nullable=False)
    folder_id = Column(Integer, ForeignKey("script_folders.id"), nullable=True)
    dependencies = Column(JSON, nullable=True, default=list)

    # Relationships
    folder: RelationshipProperty[Optional["ScriptFolder"]] = relationship(
        "ScriptFolder", back_populates="scripts"
    )


class AppSettings(Base, TimestampMixin):
    __tablename__ = "app_settings"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    value = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False)


class RobotArmLocation(Base, TimestampMixin):
    __tablename__ = "robot_arm_locations"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    location_type = Column(String, nullable=False)
    coordinates = Column(String, nullable=False)
    tool_id = Column(Integer, ForeignKey("tools.id"))
    orientation = Column(String, nullable=False)
    tool: RelationshipProperty[Optional["Tool"]] = relationship(
        "Tool", back_populates="robot_arm_locations"
    )

    __table_args__ = (
        CheckConstraint("name <> ''", name="check_non_empty_name"),
        UniqueConstraint('name', 'tool_id', name='unique_name_per_tool')
    )


class RobotArmSequence(Base, TimestampMixin):
    __tablename__ = "robot_arm_sequences"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    commands = Column(JSON, nullable=False)
    tool_id = Column(Integer, ForeignKey("tools.id"))
    labware = Column(String, nullable=True)
    tool: RelationshipProperty[Optional["Tool"]] = relationship(
        "Tool", back_populates="robot_arm_sequences"
    )

    __table_args__ = (CheckConstraint("name <> ''", name="check_non_empty_name"),)


class RobotArmMotionProfile(Base, TimestampMixin):
    __tablename__ = "robot_arm_motion_profiles"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    speed = Column(Float, nullable=False)
    speed2 = Column(Float, nullable=False)
    acceleration = Column(Float, nullable=False)
    deceleration = Column(Float, nullable=False)
    accel_ramp = Column(Float, nullable=False)
    decel_ramp = Column(Float, nullable=False)
    inrange = Column(Float, nullable=False)
    straight = Column(Integer, nullable=False)
    tool_id = Column(Integer, ForeignKey("tools.id"))
    tool: RelationshipProperty[Optional["Tool"]] = relationship(
        "Tool", back_populates="robot_arm_motion_profiles"
    )

    __table_args__ = (CheckConstraint("name <> ''", name="check_non_empty_name"),)


class RobotArmGripParams(Base, TimestampMixin):
    __tablename__ = "robot_arm_grip_params"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    width = Column(Integer, nullable=False)
    speed = Column(Integer, nullable=False)
    force = Column(Integer, nullable=False)
    tool_id = Column(Integer, ForeignKey("tools.id"))
    tool: RelationshipProperty[Optional["Tool"]] = relationship(
        "Tool", back_populates="robot_arm_grip_params"
    )

    __table_args__ = (CheckConstraint("name <> ''", name="check_non_empty_name"),)


class Protocol(Base, TimestampMixin):
    __tablename__ = "protocols"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    workcell_id = Column(Integer, ForeignKey("workcells.id"))
    description = Column(String, nullable=True)
    icon = Column(String, nullable=True)
    params = Column(JSON, nullable=False)  # Zod schema for parameters
    commands = Column(JSON, nullable=False)  # Template for generating commands
    version = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, nullable=False, default=True)

    workcell: RelationshipProperty[Optional["Workcell"]] = relationship(
        "Workcell", back_populates="protocols"
    )

    __table_args__ = (CheckConstraint("name <> ''", name="check_non_empty_name"),)
