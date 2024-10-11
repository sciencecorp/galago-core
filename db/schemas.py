import typing as t
from pydantic import BaseModel, model_validator
import datetime
import logging

# Workcell schemas
class WorkcellCreate(BaseModel):
    name: str


class WorkcellUpdate(BaseModel):
    name: t.Optional[str] = None


class Workcell(WorkcellCreate):
    id: int

    class Config:
        from_attributes=True
        #orm_mode = True 


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
    instrument_id: int


class NestUpdate(BaseModel):
    name: t.Optional[str] = None
    row: t.Optional[int] = None
    column: t.Optional[int] = None
    instrument_id: t.Optional[int] = None


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
    log_type_id: int 
    tool: str
    value: str
    created_at: t.Optional[datetime.datetime]

class LogUpdate(BaseModel):
    id: t.Optional[int] = None
    name: t.Optional[str] = None


class Log(LogCreate):
    id: int
    
    class Config:
        from_attributes=True
        #orm_mode = True 

class LogTypeCreate(BaseModel):
    name: str

class LogPaginated(BaseModel):
    log_type: t.Optional[str] = None
    tool: t.Optional[str] = None
    value: t.Optional[str] = None
    created_at: t.Optional[datetime.datetime] = None


class LogTypeUpdate(BaseModel):
    id: t.Optional[int] = None
    name: t.Optional[str] = None

class LogType(LogTypeCreate):
    id: int

    class Config:
        from_attributes=True


class VariableBase(BaseModel):
    name: str
    value: str
    type: str 

    @classmethod
    def validate_value_type(cls, data: t.Any) -> t.Any:
        logging.info(f"Checking data: {data}")
        logging.info(f"Checking data type: {type(data)}")
        model_dictionary = {}

        if isinstance(data, dict):
            for key, value in data.items():
                model_dictionary[key] = value
                logging.info(f"Checking key: {key}")
                logging.info(f"Checking value: {value}")
                if key == 'type' and value not in ['string', 'number', 'boolean', 'array', 'json']:
                    raise ValueError('Type must be one of string, number, boolean, array, json')

            if 'type' in model_dictionary and 'value' in model_dictionary:
                logging.info(f"Checking value type: {model_dictionary['type']}")
                logging.info(f"Checking value: {model_dictionary['value']}")
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

class Variable(VariableCreate):
    id: int
    
    class Config:
        from_attributes=True

class VariableUpdate(BaseModel):
    value: str
    type: str 

    @model_validator(mode='before')
    @classmethod
    def check_value_type(cls, data: t.Any) -> t.Any:
        return VariableBase.validate_value_type(data)
