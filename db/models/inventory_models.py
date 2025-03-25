from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    String,
    JSON,
    Date,
    Boolean,
    Float,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from .db_session import Base
from .utils import TimestampMixin


class Workcell(Base, TimestampMixin):
    __tablename__ = "workcells"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    location = Column(String, nullable=True)
    description = Column(String, nullable=True)
    tools = relationship(
        "Tool", back_populates="workcell", cascade="all, delete-orphan"
    )  # type: List["Tool"]  # type: ignore

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
    workcell = relationship(
        "Workcell", back_populates="tools"
    )  # type: Optional["Workcell"]  # type: ignore
    nests = relationship(
        "Nest", back_populates="tool"
    )  # type: List["Nest"]  # type: ignore
    robot_arm_locations = relationship(
        "RobotArmLocation", back_populates="tool"
    )  # type: List["RobotArmLocation"]  # type: ignore
    robot_arm_nests = relationship(
        "RobotArmNest", back_populates="tool"
    )  # type: List["RobotArmNest"]  # type: ignore
    robot_arm_sequences = relationship(
        "RobotArmSequence", back_populates="tool"
    )  # type: List["RobotArmSequence"]  # type: ignore
    robot_arm_motion_profiles = relationship(
        "RobotArmMotionProfile", back_populates="tool"
    )  # type: List["RobotArmMotionProfile"]  # type: ignore
    robot_arm_grip_params = relationship(
        "RobotArmGripParams", back_populates="tool"
    )  # type: List["RobotArmGripParams"]  # type: ignore

    __table_args__ = (CheckConstraint("name <> ''", name="check_non_empty_name"),)


class Nest(Base, TimestampMixin):
    __tablename__ = "nests"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    row = Column(Integer)
    column = Column(Integer)
    tool_id = Column(Integer, ForeignKey("tools.id"))
    tool = relationship(
        "Tool", back_populates="nests"
    )  # type: Optional["Tool"] # type: ignore
    plate = relationship(
        "Plate", back_populates="nest", uselist=False
    )  # type: Optional["Plate"]  # type: ignore


class Plate(Base, TimestampMixin):
    __tablename__ = "plates"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=True)
    barcode = Column(String)
    plate_type = Column(String)
    nest_id = Column(Integer, ForeignKey("nests.id"), nullable=True)
    nest = relationship(
        "Nest", back_populates="plate"
    )  # type: Optional["Nest"]  # type: ignore
    wells = relationship(
        "Well", back_populates="plate"
    )  # type: List["Well"]  # type: ignore


class Well(Base, TimestampMixin):
    __tablename__ = "wells"
    id = Column(Integer, primary_key=True)
    row = Column(String)
    column = Column(Integer)

    plate_id = Column(Integer, ForeignKey("plates.id"))
    plate = relationship(
        "Plate", back_populates="wells"
    )  # type: Optional["Plate"]  # type: ignore
    reagents = relationship(
        "Reagent", back_populates="well"
    )  # type: List["Reagent"]  # type: ignore


class Reagent(Base, TimestampMixin):
    __tablename__ = "reagents"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    expiration_date = Column(Date)
    volume = Column(Float)

    well_id = Column(Integer, ForeignKey("wells.id"))
    well = relationship(
        "Well", back_populates="reagents"
    )  # type: Optional["Well"]  # type: ignore


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
    parent = relationship(
        "ScriptFolder", remote_side=[id], backref="subfolders"
    )  # type: Optional["ScriptFolder"]  # type: ignore
    scripts = relationship(
        "Script", back_populates="folder"
    )  # type: List["Script"]  # type: ignore


class Script(Base, TimestampMixin):
    __tablename__ = "scripts"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=False)
    content = Column(String, nullable=False)
    language = Column(String, nullable=False)
    is_blocking = Column(Boolean, nullable=False)
    folder_id = Column(Integer, ForeignKey("script_folders.id"), nullable=True)

    # Relationships
    folder = relationship(
        "ScriptFolder", back_populates="scripts"
    )  # type: Optional["ScriptFolder"]  # type: ignore


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
    location_type = Column(String, nullable=False)
    coordinates = Column(String, nullable=False)
    tool_id = Column(Integer, ForeignKey("tools.id"))
    orientation = Column(String, nullable=False)
    tool = relationship(
        "Tool", back_populates="robot_arm_locations"
    )  # type: Optional["Tool"]  # type: ignore
    dependent_nests = relationship(
        "RobotArmNest", back_populates="safe_location", cascade="all, delete-orphan"
    )  # type: List["RobotArmNest"]  # type: ignore

    __table_args__ = (CheckConstraint("name <> ''", name="check_non_empty_name"),)


class RobotArmNest(Base, TimestampMixin):
    __tablename__ = "robot_arm_nests"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    orientation = Column(String, nullable=False)
    location_type = Column(String, nullable=False)
    coordinates = Column(String, nullable=False)
    safe_location_id = Column(Integer, ForeignKey("robot_arm_locations.id"))
    tool_id = Column(Integer, ForeignKey("tools.id"))
    tool = relationship(
        "Tool", back_populates="robot_arm_nests"
    )  # type: Optional["Tool"]  # type: ignore
    safe_location = relationship(
        "RobotArmLocation"
    )  # type: Optional["RobotArmLocation"]  # type: ignore

    __table_args__ = (CheckConstraint("name <> ''", name="check_non_empty_name"),)


class RobotArmSequence(Base, TimestampMixin):
    __tablename__ = "robot_arm_sequences"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    commands = Column(JSON, nullable=False)
    tool_id = Column(Integer, ForeignKey("tools.id"))
    labware = Column(String, nullable=True)
    tool = relationship(
        "Tool", back_populates="robot_arm_sequences"
    )  # type: Optional["Tool"]  # type: ignore

    __table_args__ = (CheckConstraint("name <> ''", name="check_non_empty_name"),)


class RobotArmMotionProfile(Base, TimestampMixin):
    __tablename__ = "robot_arm_motion_profiles"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    profile_id = Column(Integer, nullable=False)
    speed = Column(Float, nullable=False)
    speed2 = Column(Float, nullable=False)
    acceleration = Column(Float, nullable=False)
    deceleration = Column(Float, nullable=False)
    accel_ramp = Column(Float, nullable=False)
    decel_ramp = Column(Float, nullable=False)
    inrange = Column(Float, nullable=False)
    straight = Column(Integer, nullable=False)
    tool_id = Column(Integer, ForeignKey("tools.id"))
    tool = relationship(
        "Tool", back_populates="robot_arm_motion_profiles"
    )  # type: Optional["Tool"]  # type: ignore

    __table_args__ = (
        CheckConstraint("name <> ''", name="check_non_empty_name"),
        CheckConstraint(
            "profile_id >= 1 AND profile_id <= 14", name="check_profile_id_range"
        ),
    )


class RobotArmGripParams(Base, TimestampMixin):
    __tablename__ = "robot_arm_grip_params"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    width = Column(Integer, nullable=False)
    speed = Column(Integer, nullable=False)
    force = Column(Integer, nullable=False)
    tool_id = Column(Integer, ForeignKey("tools.id"))
    tool = relationship(
        "Tool", back_populates="robot_arm_grip_params"
    )  # type: Optional["Tool"]  # type: ignore

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

    workcell = relationship("Workcell")  # type: Optional["Workcell"]  # type: ignore

    __table_args__ = (CheckConstraint("name <> ''", name="check_non_empty_name"),)
