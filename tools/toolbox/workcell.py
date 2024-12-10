from tools.toolbox.db import Db 

db = Db()

def get_workcell(id:int):
    response = db.get_by_id_or_name(id, "workcells")
    return response
    
def get_all_workcells():
    response = db.get_data("workcells")
    return response

