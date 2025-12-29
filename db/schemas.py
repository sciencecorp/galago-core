import json
import typing as t
from datetime import date, datetime
from enum import Enum as PyEnum
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, ConfigDict, model_validator


class TimestampMixin(BaseModel):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class ToolCreate(BaseModel):
    type: str
    name: str
    description: t.Optional[str] = None
    image_url: t.Optional[str] = None
    ip: str = "localhost"
    port: t.Optional[int] = None
    config: t.Optional[dict] = None
    workcell_id: t.Optional[int] = None


class ToolUpdate(BaseModel):
    name: t.Optional[str] = None
    description: t.Optional[str] = None
    image_url: t.Optional[str] = None
    ip: t.Optional[str] = None
    port: t.Optional[int] = None
    config: t.Optional[dict] = None


class Tool(ToolCreate, TimestampMixin):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Workcell Schemas
class WorkcellCreate(BaseModel):
    name: str
    description: t.Optional[str] = None
    location: t.Optional[str] = None


class WorkcellUpdate(BaseModel):
    name: t.Optional[str] = None
    description: t.Optional[str] = None
    location: t.Optional[str] = None


class Workcell(WorkcellCreate, TimestampMixin):
    id: int
    tools: t.List["Tool"] = []
    protocols: t.List["Protocol"] = []

    class Config:
        from_attributes = True


# Instrument Schemas
class InstrumentCreate(BaseModel):
    name: str
    workcell_id: int


class InstrumentUpdate(BaseModel):
    name: t.Optional[str] = None
    workcell_id: t.Optional[int] = None


class Instrument(InstrumentCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Enum schemas
class NestStatus(str, PyEnum):
    empty = "empty"
    occupied = "occupied"
    reserved = "reserved"
    error = "error"


class PlateStatus(str, PyEnum):
    stored = "stored"
    checked_out = "checked_out"
    completed = "completed"
    disposed = "disposed"


class PlateNestAction(str, PyEnum):
    check_in = "check_in"
    check_out = "check_out"
    transfer = "transfer"


# Nest Schemas
class NestBase(BaseModel):
    name: str
    row: int
    column: int
    tool_id: t.Optional[int] = None
    hotel_id: t.Optional[int] = None
    status: NestStatus = NestStatus.empty

    @model_validator(mode="after")
    def validate_parent(self) -> "NestBase":
        if self.tool_id is None and self.hotel_id is None:
            raise ValueError("A nest must be associated with either a tool or a hotel")
        if self.tool_id is not None and self.hotel_id is not None:
            raise ValueError("A nest cannot be associated with both a tool and a hotel")
        return self


class NestCreate(NestBase):
    pass


class NestUpdate(NestBase):
    pass


class Nest(NestBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Plate Schemas
class PlateBase(BaseModel):
    name: t.Optional[str] = None
    barcode: str
    plate_type: str
    nest_id: t.Optional[int] = None
    status: PlateStatus = PlateStatus.stored


class PlateCreate(PlateBase):
    pass


class PlateUpdate(PlateBase):
    pass


class Plate(PlateBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Well Schemas
class WellCreate(BaseModel):
    row: str
    column: int
    plate_id: int


class WellUpdate(BaseModel):
    row: t.Optional[str] = None
    column: t.Optional[int] = None
    plate_id: t.Optional[int] = None


class Well(WellCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Reagent Schemas
class ReagentCreate(BaseModel):
    name: str
    expiration_date: date
    volume: float
    well_id: int
    model_config = ConfigDict(from_attributes=True)


class ReagentUpdate(BaseModel):
    name: t.Optional[str] = None
    expiration_date: t.Optional[date] = None
    volume: t.Optional[float] = None
    well_id: t.Optional[int] = None


class Reagent(ReagentCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Hotel Schemas
class HotelCreate(BaseModel):
    name: str
    description: t.Optional[str] = None
    image_url: t.Optional[str] = None
    workcell_id: int
    rows: int
    columns: int


class HotelUpdate(BaseModel):
    name: t.Optional[str] = None
    description: t.Optional[str] = None
    image_url: t.Optional[str] = None
    rows: t.Optional[int] = None
    columns: t.Optional[int] = None


class Hotel(HotelCreate, TimestampMixin):
    id: int
    nests: t.List[Nest] = []
    model_config = ConfigDict(from_attributes=True)


class Inventory(BaseModel):
    workcell: Workcell
    instruments: t.List[Instrument]
    hotels: t.List[Hotel] = []
    nests: t.List[Nest]
    plates: t.List[Plate]
    wells: t.List[Well]
    reagents: t.List[Reagent]


class PlateInfo(Plate):
    nest: t.Optional[Nest] = None
    wells: t.List["Well"]


class VariableBase(BaseModel):
    name: str
    value: str
    type: str

    @classmethod
    def validate_value_type(cls, data: t.Any) -> t.Any:
        if not isinstance(data, dict):
            return data

        model_dictionary = data.copy()

        # Validate type field first
        if "type" in model_dictionary and model_dictionary["type"] not in [
            "string",
            "number",
            "boolean",
            "array",
            "json",
        ]:
            raise ValueError(
                "Type must be one of: string, number, boolean, array, json"
            )

        # Only validate value if both type and value are present
        if "type" not in model_dictionary or "value" not in model_dictionary:
            return data

        value_type = model_dictionary["type"]
        value = model_dictionary["value"]

        # Ensure value is always a string (this is how they're stored)
        if not isinstance(value, str):
            raise ValueError("All values must be provided as strings")

        if value_type == "string":
            # String values are always valid
            pass

        elif value_type == "number":
            if value.strip() == "":
                raise ValueError("Number value cannot be empty")
            try:
                float(value)
            except (ValueError, TypeError):
                raise ValueError(f"Value '{value}' is not a valid number")

        elif value_type == "boolean":
            if value.strip().lower() not in ["true", "false"]:
                raise ValueError(
                    "Boolean value must be 'true' or 'false' (case insensitive)"
                )

        elif value_type == "array":
            # Arrays must start with [ and end with ]
            if not value.strip().startswith("[") or not value.strip().endswith("]"):
                raise ValueError("Array must start with [ and end with ]")

            try:
                # Parse as JSON to validate structure
                parsed_array = json.loads(value)

                # Must be a list
                if not isinstance(parsed_array, list):
                    raise ValueError("Array value must be a JSON array")

                # Empty arrays are valid
                if len(parsed_array) == 0:
                    pass
                else:
                    # Check that all elements are the same type
                    first_element = parsed_array[0]
                    first_type = type(first_element)

                    # Only allow string, number (int/float), or boolean
                    if first_type not in [str, int, float, bool]:
                        raise ValueError(
                            "Array elements must be strings, numbers, or booleans only"
                        )

                    # Check all elements are same type (treat int and float as same type)
                    for i, element in enumerate(parsed_array):
                        element_type = type(element)

                        # Reject nested arrays or objects
                        if isinstance(element, (list, dict)):
                            raise ValueError(
                                "Nested arrays and objects are not allowed"
                            )

                        # Check type consistency (treat int/float as numbers)
                        if first_type in [int, float] and element_type in [int, float]:
                            continue  # Both are numbers, OK
                        elif element_type != first_type:
                            raise ValueError(
                                f"All array elements must be the same type. Found {first_type.__name__} and {element_type.__name__}"
                            )

            except json.JSONDecodeError as e:
                raise ValueError(f"Array must be valid JSON: {str(e)}")

        elif value_type == "json":
            if value.strip() == "":
                raise ValueError("JSON value cannot be empty")
            try:
                json.loads(value)
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSON format: {str(e)}")

        return data


class VariableCreate(VariableBase):
    name: str
    type: str
    workcell_id: t.Optional[int] = None

    @model_validator(mode="before")
    @classmethod
    def check_value_type(cls, data: t.Any) -> t.Any:
        return cls.validate_value_type(data)


class Variable(TimestampMixin, VariableCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class VariableUpdate(BaseModel):
    name: t.Optional[str] = None
    value: t.Optional[str] = None
    type: t.Optional[str] = None
    workcell_id: t.Optional[int] = None

    @model_validator(mode="before")
    @classmethod
    def check_value_type(cls, data: t.Any) -> t.Any:
        return VariableBase.validate_value_type(data)


# Helper functions for working with variables
class VariableHelpers:
    @staticmethod
    def parse_array_value(value: str) -> list[str]:
        """Parse comma-separated string into list of strings.

        Args:
            value: Comma-separated string (e.g., "item1, item2, item3")

        Returns:
            List of strings with whitespace stripped

        Examples:
            parse_array_value("a, b, c") -> ["a", "b", "c"]
            parse_array_value("") -> []
            parse_array_value("single") -> ["single"]
        """
        if not value or value.strip() == "":
            return []

        # Split by comma and strip whitespace from each item
        items = [item.strip() for item in value.split(",")]
        # Filter out empty strings that might result from consecutive commas
        return [item for item in items if item != ""]

    @staticmethod
    def parse_json_value(value: str) -> t.Any:
        """Parse JSON string into Python object.

        Raises:
            json.JSONDecodeError: If the string is not valid JSON
        """
        if not value or value.strip() == "":
            raise ValueError("JSON value cannot be empty")
        return json.loads(value)

    @staticmethod
    def parse_boolean_value(value: str) -> bool:
        """Parse string boolean into Python boolean.

        Args:
            value: String representation of boolean ("true", "false", case-insensitive)

        Returns:
            Boolean value

        Raises:
            ValueError: If value is not a valid boolean string
        """
        if not isinstance(value, str):
            raise ValueError("Boolean value must be a string")

        lower_value = value.strip().lower()
        if lower_value == "true":
            return True
        elif lower_value == "false":
            return False
        else:
            raise ValueError(
                "Boolean value must be 'true' or 'false' (case insensitive)"
            )

    @staticmethod
    def parse_number_value(value: str) -> float:
        """Parse string number into Python float.

        Raises:
            ValueError: If the string cannot be converted to a number
        """
        if not value or value.strip() == "":
            raise ValueError("Number value cannot be empty")
        return float(value.strip())

    @staticmethod
    def format_array_value(items: list[str]) -> str:
        """Format list of strings into comma-separated string.

        Args:
            items: List of strings to join

        Returns:
            Comma-separated string with spaces after commas
        """
        return ", ".join(str(item) for item in items)

    @staticmethod
    def format_json_value(obj: t.Any) -> str:
        """Format Python object into compact JSON string.

        Args:
            obj: Python object to serialize to JSON

        Returns:
            Compact JSON string (no extra whitespace)
        """
        return json.dumps(obj, separators=(",", ":"))

    @staticmethod
    def get_parsed_value(variable: Variable) -> t.Any:
        """Get the parsed value based on the variable type.

        Args:
            variable: Variable instance with type and string value

        Returns:
            Parsed value in appropriate Python type:
            - string -> str
            - number -> float
            - boolean -> bool
            - array -> list[str]
            - json -> Any (parsed JSON)
        """
        if variable.type == "string":
            return variable.value
        elif variable.type == "number":
            return VariableHelpers.parse_number_value(variable.value)
        elif variable.type == "boolean":
            return VariableHelpers.parse_boolean_value(variable.value)
        elif variable.type == "array":
            return VariableHelpers.parse_array_value(variable.value)
        elif variable.type == "json":
            return VariableHelpers.parse_json_value(variable.value)
        else:
            # Unknown type, return as string
            return variable.value

    @staticmethod
    def validate_and_format_value(value: str, variable_type: str) -> str:
        """Validate a value for a given type and return formatted string.

        This is useful for preprocessing values before creating/updating variables.

        Args:
            value: Raw value as string
            variable_type: Type to validate against

        Returns:
            Formatted string value ready for storage

        Raises:
            ValueError: If value is invalid for the given type
        """
        if variable_type == "string":
            return value
        elif variable_type == "number":
            # Validate by parsing, then return original string
            float(value.strip())
            return value.strip()
        elif variable_type == "boolean":
            # Validate and normalize
            parsed = VariableHelpers.parse_boolean_value(value)
            return "true" if parsed else "false"
        elif variable_type == "array":
            # Validate by parsing, then return normalized format
            items = VariableHelpers.parse_array_value(value)
            return VariableHelpers.format_array_value(items)
        elif variable_type == "json":
            # Validate by parsing, then return formatted JSON
            obj = VariableHelpers.parse_json_value(value)
            return VariableHelpers.format_json_value(obj)
        else:
            raise ValueError(f"Unknown variable type: {variable_type}")


class LabwareCreate(BaseModel):
    name: str
    description: str
    number_of_rows: int
    number_of_columns: int
    z_offset: float = 0
    width: t.Optional[float] = 127.8
    height: t.Optional[float] = 14.5
    plate_lid_offset: t.Optional[float] = 0
    lid_offset: t.Optional[float] = 0
    stack_height: t.Optional[float] = 0
    has_lid: t.Optional[bool] = False
    image_url: t.Optional[str] = ""
    workcell_id: t.Optional[int] = None


class Labware(TimestampMixin, LabwareCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class LabwareUpdate(BaseModel):
    name: t.Optional[str] = None
    description: t.Optional[str] = None
    number_of_rows: t.Optional[int] = None
    number_of_columns: t.Optional[int] = None
    z_offset: t.Optional[float] = None
    width: t.Optional[float] = None
    height: t.Optional[float] = None
    plate_lid_offset: t.Optional[float] = None
    lid_offset: t.Optional[float] = None
    stack_height: t.Optional[float] = None
    has_lid: t.Optional[bool] = None
    image_url: t.Optional[str] = None
    workcell_id: t.Optional[int] = None


# Schemas for waypoint data
class TeachPoint(BaseModel):
    name: str
    coordinates: str
    type: str = "location"
    loc_type: str = "j"
    orientation: Optional[str] = "landscape"


class Command(BaseModel):
    command: str
    params: Dict
    order: int


class Sequence(BaseModel):
    name: str
    description: Optional[str] = ""
    commands: List[Command]
    tool_id: int = 1


class MotionProfile(BaseModel):
    name: str
    profile_id: int
    speed: float = 100
    speed2: float = 100
    acceleration: float = 100
    deceleration: float = 100
    accel_ramp: float = 0.2
    decel_ramp: float = 0.2
    inrange: int = 1
    straight: int = 0
    tool_id: int = 1


class GripParam(BaseModel):
    name: str
    width: float
    force: float = 15
    speed: float = 10
    tool_id: int = 1


class WaypointData(BaseModel):
    teach_points: Optional[List[TeachPoint]] = None
    sequences: Optional[List[Sequence]] = None
    motion_profiles: Optional[List[MotionProfile]] = None
    grip_params: Optional[List[GripParam]] = None


class ProtocolBase(BaseModel):
    name: str
    category: str
    workcell_id: int
    description: t.Optional[str] = None
    commands: t.List[t.Dict[str, t.Any]]


class ProtocolCreate(BaseModel):
    name: str
    category: str
    workcell_id: int
    description: Optional[str] = None
    commands: List[Dict[str, Any]]


class ProtocolUpdate(BaseModel):
    name: t.Optional[str] = None
    category: t.Optional[str] = None
    description: t.Optional[str] = None
    commands: t.Optional[t.List[t.Dict[str, t.Any]]] = None


class Protocol(ProtocolBase):
    id: int
    created_at: t.Optional[datetime] = None
    updated_at: t.Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={datetime: lambda dt: dt.isoformat()},
    )


class AppSettingsCreate(BaseModel):
    name: str
    value: str
    is_active: bool = True


class AppSettingsUpdate(BaseModel):
    name: t.Optional[str] = None
    value: t.Optional[str] = None
    is_active: t.Optional[bool] = None


class AppSettings(TimestampMixin, AppSettingsCreate):
    id: int

    class Config:
        from_attributes = True


class ScriptBase(BaseModel):
    name: str
    description: t.Optional[str] = None
    content: str = ""
    language: str = "python"
    is_blocking: bool = True
    folder_id: t.Optional[int] = None
    workcell_id: t.Optional[int] = None


class ScriptCreate(ScriptBase):
    pass


class ScriptUpdate(BaseModel):
    name: t.Optional[str] = None
    description: t.Optional[str] = None
    content: t.Optional[str] = None
    language: t.Optional[str] = None
    is_blocking: t.Optional[bool] = None
    folder_id: t.Optional[int] = None
    workcell_id: t.Optional[int] = None


class Script(ScriptBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ScriptFolderBase(BaseModel):
    name: str
    description: t.Optional[str] = None
    parent_id: t.Optional[int] = None
    workcell_id: int


class ScriptFolderCreate(ScriptFolderBase):
    pass


class ScriptFolderUpdate(BaseModel):
    name: t.Optional[str] = None
    description: t.Optional[str] = None
    parent_id: t.Optional[int] = None
    workcell_id: t.Optional[int] = None


class ScriptFolder(ScriptFolderBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    subfolders: list["ScriptFolder"] = []
    scripts: list["Script"] = []


# Break the circular reference by using a simplified script model for folders
class ScriptFolderResponse(ScriptFolderBase):
    id: int
    created_at: datetime
    updated_at: datetime
    subfolders: list["ScriptFolderResponse"] = []
    scripts: list["Script"] = []

    class Config:
        from_attributes = True


# RobotArm Location Schemas
class RobotArmLocationCreate(BaseModel):
    name: str
    location_type: str  # 'j' for joint or 'c' for cartesian
    coordinates: t.Optional[str] = None  # Space-separated coordinate values
    tool_id: int
    orientation: t.Literal["portrait", "landscape"]


class RobotArmLocationUpdate(BaseModel):
    name: t.Optional[str] = None
    location_type: t.Optional[str] = None
    coordinates: t.Optional[str] = None  # Space-separated coordinate values
    tool_id: t.Optional[int] = None
    orientation: t.Optional[t.Literal["portrait", "landscape"]] = None


class RobotArmLocation(RobotArmLocationCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# RobotArm Nest Schemas
class RobotArmNestCreate(BaseModel):
    name: str
    orientation: t.Literal["portrait", "landscape"]
    location_type: str  # 'j' for joint or 'c' for cartesian
    coordinates: t.Optional[str] = None  # Space-separated coordinate values
    safe_location_id: t.Optional[int] = None
    tool_id: int


class RobotArmNestUpdate(BaseModel):
    name: t.Optional[str] = None
    orientation: t.Optional[t.Literal["portrait", "landscape"]] = None
    location_type: t.Optional[str] = None  # 'j' for joint or 'c' for cartesian
    coordinates: t.Optional[str] = None  # Space-separated coordinate values
    safe_location_id: t.Optional[int] = None
    tool_id: t.Optional[int] = None


class RobotArmNest(RobotArmNestCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# RobotArm Sequence Schemas
class RobotArmSequenceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    commands: List[Dict[str, Any]]
    tool_id: int
    labware: Optional[str] = None


class RobotArmSequenceUpdate(BaseModel):
    name: t.Optional[str] = None
    description: t.Optional[str] = None
    commands: t.Optional[List[Dict[str, Any]]] = None
    tool_id: t.Optional[int] = None
    labware: t.Optional[str] = None


class RobotArmSequence(RobotArmSequenceCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Motion Profile Schemas
class RobotArmMotionProfileCreate(BaseModel):
    name: str
    speed: float
    speed2: float
    acceleration: float
    deceleration: float
    accel_ramp: float
    decel_ramp: float
    inrange: float
    straight: int
    tool_id: int


class RobotArmMotionProfileUpdate(BaseModel):
    name: t.Optional[str] = None
    speed: t.Optional[float] = None
    speed2: t.Optional[float] = None
    acceleration: t.Optional[float] = None
    deceleration: t.Optional[float] = None
    accel_ramp: t.Optional[float] = None
    decel_ramp: t.Optional[float] = None
    inrange: t.Optional[float] = None
    straight: t.Optional[int] = None
    tool_id: t.Optional[int] = None


class RobotArmMotionProfile(RobotArmMotionProfileCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class RobotArmMotionProfileResponse(BaseModel):
    name: str
    speed: float
    speed2: float
    acceleration: float
    deceleration: float
    accel_ramp: float
    decel_ramp: float
    inrange: float
    straight: int
    id: int

    model_config = ConfigDict(from_attributes=True)


# Grip Params Schemas
class RobotArmGripParamsCreate(BaseModel):
    name: str
    width: float
    speed: float
    force: float
    tool_id: int


class RobotArmGripParamsUpdate(BaseModel):
    name: t.Optional[str] = None
    width: t.Optional[float] = None
    speed: t.Optional[float] = None
    force: t.Optional[float] = None
    tool_id: t.Optional[int] = None


class RobotArmGripParams(RobotArmGripParamsCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class RobotArmWaypoints(BaseModel):
    tool_name: str
    name: str
    locations: list[RobotArmLocation]  # Full location objects
    motion_profiles: list[RobotArmMotionProfileResponse]  # Full motion profile objects
    grip_params: list[RobotArmGripParams]  # Full grip parameter objects
    sequences: list[RobotArmSequence]  # Full sequence objects
    model_config = ConfigDict(from_attributes=True)


# PlateNestHistory Schemas
class PlateNestHistoryBase(BaseModel):
    plate_id: int
    nest_id: int
    action: PlateNestAction
    timestamp: datetime


class PlateNestHistoryCreate(PlateNestHistoryBase):
    pass


class PlateNestHistoryUpdate(PlateNestHistoryBase):
    pass


class PlateNestHistory(PlateNestHistoryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Extended schemas for relationships
class NestWithRelations(Nest):
    current_plate: t.Optional[Plate] = None
    plate_history: t.List[PlateNestHistory] = []


class PlateWithRelations(Plate):
    current_nest: t.Optional[Nest] = None
    nest_history: t.List[PlateNestHistory] = []
    wells: t.List["Well"] = []


class FormFieldOption(BaseModel):
    value: str
    label: str


class FormField(BaseModel):
    type: str
    label: str
    required: Optional[bool] = False
    placeholder: Optional[str] = None
    options: Optional[List[FormFieldOption]] = None
    default_value: Optional[Union[str, List[str]]] = None
    mapped_variable: Optional[str] = None


class FormCreate(BaseModel):
    name: str
    fields: Optional[List[FormField]] = None
    background_color: t.Optional[str] = None
    font_color: t.Optional[str] = None
    workcell_id: t.Optional[int] = None


class FormUpdate(BaseModel):
    name: t.Optional[str] = None
    fields: Optional[List[FormField]] = None
    background_color: t.Optional[str] = None
    font_color: t.Optional[str] = None
    workcell_id: t.Optional[int] = None


class Form(TimestampMixin, FormCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)
