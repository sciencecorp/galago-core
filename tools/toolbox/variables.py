import typing as t
from tools.toolbox.db import Db 

db = Db()

def get_variable(name:str):
    response = db.get_by_id_or_name(name, "variables")
    return response
    
def get_all_variables():
    response = db.get_data("variables")
    return response

def create_variable(data:dict):
    response = db.post_data(data, "variables")
    return response

def update_variable(name:str, new_value:t.Union[str,int,bool]):
    variable = {"value": new_value}
    response = db.update_data(name, variable, "variables")
    return response

def delete_variable(name:str):
    response = db.delete_data(name, "variables")
    return response
