from datetime import datetime
import os
import logging
from enum import Enum 
import tools.db.crud as crud
import tools.db.schemas as schemas
from tools.db.models.db import LogsSessionLocal
from typing import Optional
import json 

class LogType(Enum):
    ERROR = "ERROR",
    WARNING = "WARNING",
    DEBUG = "DEBUG",
    INFO = "INFO",
    PLATE_MOVE = "PLATE_MOVE",
    RUN_START = "RUN_START",
    RUN_END = "RUN_END",
    PLATE_READ = "PLATE_READ",


def db_exists() -> bool:
    if os.path.exists("logs.db"):
        return True
    return False

def write_to_db(log_type:LogType,tool:str,value:str) -> None:
    engine = LogsSessionLocal()
    try:
        log_type_id = crud.log_type.get_by(engine, obj_in={"name":str(log_type.name)})
        if not log_type_id:
            raise NameError(log_type.name + "has not beed added to log_type table.")
        crud.logs.create(engine, obj_in = schemas.LogCreate(log_type_id=log_type_id.id, tool= str(tool), value=json.dumps(value), created_at=datetime.now()))
    finally:
        engine.close()

def write_trace_log(log_path:Optional[str], log_type:LogType, tool:str,value:str) -> None:

    if not log_path:
        logging.warning("Log folder not configured")
    #Write to sqlite db
    #write_to_db(log_type=log_type, tool=tool, value=value)
    #Write to local files
    if log_path is None:
        return
    if not os.path.exists(log_path):
        try:
            os.makedirs(log_path)
        except Exception as e:
            logging.warning(f"Failed to create log folder. {e}")
            return
    file_folder= os.path.join(log_path, datetime.today().strftime('%Y-%m-%d'))
    if(os.path.exists(file_folder) is False):
        logging.debug("folder does not exist. creating folder")
        os.mkdir(file_folder)

    trace_file = os.path.join(file_folder, "trace_log.txt")
    error_file = os.path.join(file_folder, "error_log.txt")

    try:
        if os.path.exists(trace_file) is False:
            with open(trace_file, 'w+') as f:
                f.write('Time,Tool,Value\n')
        if(log_type == LogType.ERROR):
            if os.path.exists(error_file) is False:
                with open(error_file, 'w+') as f:
                    f.write('Time,Tool,Error\n')
    except Exception as e:
        logging.debug(e)
        return
    
    try:
        with open(trace_file, 'a') as f:
            f.write(str(datetime.today())+","+str(log_type.name)+","+tool+","+value+"\n")
        if log_type == LogType.ERROR:
            with open(error_file, 'a') as f:
                 f.write(str(datetime.today())+","+str(log_type.name)+","+tool+","+value+"\n")
    except Exception as e:
        logging.debug(e)
        return
