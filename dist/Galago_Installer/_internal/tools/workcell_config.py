from pydantic import BaseModel

class Tool(BaseModel):
    id: str
    name :str 
    type: str 
    port: int

class WorkcellConfig(BaseModel):
    id:str
    name: str
    host:str
    tools: list[Tool]
