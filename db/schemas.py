import typing as t
from pydantic import BaseModel, model_validator
import datetime

class TimestampMixin(BaseModel):
    created_at: t.Optional[datetime.datetime] = None
    updated_at: t.Optional[datetime.datetime] = None


class ToolCreate(BaseModel):
    type: str
    name: str
    description: t.Optional[str] = None
    image_url: t.Optional[str] = None
    ip: str = "localhost"
    port: t.Optional[int] = None
    config: t.Optional[dict] = None
    simulated: t.Optional[bool] = None
    workcell_id: t.Optional[int] = None

class ToolUpdate(BaseModel):
    name: t.Optional[str] = None
    description: t.Optional[str] = None
    image_url: t.Optional[str] = None
    ip: t.Optional[str] = None
    port: t.Optional[int] = None
    config: t.Optional[dict] = None
    simulated: t.Optional[bool] = None


class Tool(ToolCreate, TimestampMixin):
    id: int
    class Config:
        from_attributes = True


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
    tools: t.List[Tool] = []

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

    class Config:
        from_attributes=True

# Nest Schemas
class NestCreate(BaseModel):
    name: str
    row: int
    column: int
    tool_id: int


class NestUpdate(BaseModel):
    name: t.Optional[str] = None
    row: t.Optional[int] = None
    column: t.Optional[int] = None
    tool_id: t.Optional[int] = None

class Nest(NestCreate):
    id: int

    class Config:
        from_attributes=True
        #orm_mode = True 

# Plate Schemas
class PlateCreate(BaseModel):
    name: t.Optional[str] = None
    barcode: str
    plate_type: str
    nest_id: t.Optional[int] = None


class PlateUpdate(BaseModel):
    name: t.Optional[str] = None
    barcode: t.Optional[str] = None
    plate_type: t.Optional[str] = None
    nest_id: t.Optional[int] = None


class Plate(PlateCreate):
    id: int

    class Config:
        from_attributes=True
        #orm_mode = True 


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

    class Config:
        from_attributes=True
        #orm_mode = True 


# Reagent Schemas
class ReagentCreate(BaseModel):
    name: str
    expiration_date: datetime.date
    volume: float
    well_id: int


class ReagentUpdate(BaseModel):
    name: t.Optional[str] = None
    expiration_date: t.Optional[datetime.date] = None
    volume: t.Optional[float] = None
    well_id: t.Optional[int] = None


class Reagent(ReagentCreate):
    id: int

    class Config:
        from_attributes=True
        #orm_mode = True 


class Inventory(BaseModel):
    workcell: Workcell
    instruments: t.List[Instrument]
    nests: t.List[Nest]
    plates: t.List[Plate]
    wells: t.List[Well]
    reagents: t.List[Reagent]


class PlateInfo(Plate):
    nest: t.Optional[Nest] = None
    wells: t.List["Well"]

#Log schemas
class LogCreate(BaseModel):
    level: str 
    action: str
    details: str

class LogUpdate(BaseModel):
    id: t.Optional[int] = None
    name: t.Optional[str] = None

class Log(TimestampMixin, LogCreate):
    id: int
    
    class Config:
        from_attributes=True

class VariableBase(BaseModel):
    name: str
    value: str
    type: str 

    @classmethod
    def validate_value_type(cls, data: t.Any) -> t.Any:
        model_dictionary = {}

        if isinstance(data, dict):
            for key, value in data.items():
                model_dictionary[key] = value
                if key == 'type' and value not in ['string', 'number', 'boolean', 'array', 'json']:
                    raise ValueError('Type must be one of string, number, boolean, array, json')

            if 'type' in model_dictionary and 'value' in model_dictionary:
                if model_dictionary['type'] == "string" and not isinstance(model_dictionary['value'], str):
                    raise ValueError('Value must be a string')

                if model_dictionary['type'] == 'number':
                    try:
                        float(model_dictionary['value'])
                    except ValueError:
                        raise ValueError('Value must be a number')

                if model_dictionary['type'] == 'boolean' and str(model_dictionary['value']).lower() not in ['true', 'false']:
                    raise ValueError('Value must be a boolean')
            
        return data

class VariableCreate(VariableBase):
    name: str
    type: str
    
    @model_validator(mode='before')
    @classmethod
    def check_value_type(cls, data: t.Any) -> t.Any:
        return cls.validate_value_type(data)

class Variable(TimestampMixin, VariableCreate):
    id: int
    
    class Config:
        from_attributes=True

class VariableUpdate(BaseModel):
    name: t.Optional[str] = None
    value: t.Optional[t.Union[str,int,bool]] = None
    type: t.Optional[str] = None 

    @model_validator(mode='before')
    @classmethod
    def check_value_type(cls, data: t.Any) -> t.Any:
        return VariableBase.validate_value_type(data)

class LabwareCreate(BaseModel):
    name: str
    description: str
    number_of_rows: int
    number_of_columns: int
    z_offset: float = 0 
    width: float
    height: float
    plate_lid_offset: t.Optional[float] = None
    lid_offset: t.Optional[float] = None
    stack_height: t.Optional[float] = None
    has_lid: t.Optional[bool] = False
    image_url: t.Optional[str] = None

class Labware(TimestampMixin, LabwareCreate):
    id: int
    class Config:
        from_attributes=True

class LabwareUpdate(LabwareCreate):
    name: t.Optional[str] = None
    description : t.Optional[str] = None
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

class ProtocolBase(BaseModel):
    name: str
    category: str
    workcell: str
    description: t.Optional[str] = None
    commands: t.Optional[t.List[t.Any]] = None
    ui_params: t.Optional[t.Dict[str, t.Any]] = None

class ProtocolCreate(ProtocolBase):
    name: str
    category: str
    workcell: str
    description: t.Optional[str] = None

class ProtocolUpdate(ProtocolBase):
    name: t.Optional[str] = None
    category: t.Optional[str] = None
    workcell: t.Optional[str] = None
    description: t.Optional[str] = None
    commands: t.Optional[t.List[t.Any]] = None

class Protocol(ProtocolBase):
    id: int
    class Config:
        from_attributes = True

class AppSettingsCreate(BaseModel):
    name : str
    value : str
    is_active : bool = True

class AppSettingsUpdate(BaseModel):
    name : t.Optional[str] = None
    value : t.Optional[str] = None
    is_active : t.Optional[bool] = None

class AppSettings(TimestampMixin, AppSettingsCreate):
    id: int
    class Config:
        from_attributes=True