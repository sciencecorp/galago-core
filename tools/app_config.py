import os
from os.path import join, dirname
from pydantic import BaseModel
import json 
from typing import Optional
from datetime import date , time 
import logging 
import typing as t
from tools.toolbox.workcell import get_all_workcells, get_workcell
from tools.toolbox.db import Db 

ROOT_DIRECTORY = dirname(dirname(os.path.realpath(__file__)))
APP_CONFIG_FILE = join(ROOT_DIRECTORY, "app_config.json")


db = Db()

class Tool(BaseModel):
    id: int
    name :str 
    type: str 
    port: int

class WorkcellConfig(BaseModel):
    id:int
    name: str
    created_at: Optional[str]
    updated_at: Optional[str]
    description: Optional[str]
    location: Optional[str]
    tools: list[Tool]

class AppConfig(BaseModel):
    workcell:str
    data_folder:Optional[str]
    host_ip: Optional[str] 
    redis_ip: Optional[str] 
    enable_slack_errors: bool 
    slack_bot_tocken: Optional[str]
    slack_workcell_channel: Optional[str]
    slack_error_channel: Optional[str]
    slack_admins_ids: Optional[list[str]]


def get_workcell(id:int) -> WorkcellConfig:
    response = db.get_by_id_or_name(id, "workcells")
    return response
    
def get_all_workcells() -> list[WorkcellConfig]:
    response = db.get_data("workcells")
    return response

def get_selected_workcell() -> str:
    workcell = db.get_data("settings/workcell").get("value")
    return workcell

class Config():
    def __init__(self) -> None:
        self.workcell_config : Optional[WorkcellConfig] = None
        self.workcell_config_file  : str = ""
        self.app_config : AppConfig
        self.workcell_config_is_valid = False
        self.load_app_config()
        self.load_workcell_config()
        self.inventory_db = f"sqlite:///{self.app_config.data_folder}/db/inventory.db"
        self.logs_db = f"sqlite:///{self.app_config.data_folder}/db/logs.db"

    def inventory_db_exists(self) -> bool:
        if os.path.exists(self.inventory_db.replace("sqlite:///","")):
            return True
        return False
    def logs_db_exists(self) -> bool:
        if os.path.exists(self.logs_db.replace("sqlite:///","")):
            return True
        return False
        
    def load_app_config(self) -> None:
        if not os.path.exists(APP_CONFIG_FILE):
            self.app_config = AppConfig(
                workcell="workcell_1",
                data_folder=os.path.join(ROOT_DIRECTORY,"logs"),
                host_ip="localhost",
                redis_ip="127.0.0.1:1203",
                enable_slack_errors=False,
                slack_admins_ids=None,
                slack_workcell_channel=None,
                slack_error_channel=None,
                slack_bot_tocken=None,
            )
            json_config = self.app_config.__dict__
            with open(APP_CONFIG_FILE, 'w') as f:
                json.dump(json_config, f, indent=4)
        else:
            with open(APP_CONFIG_FILE) as f:
                try:
                    config = json.load(f)
                    app_config = AppConfig.parse_obj(config)
                    if app_config.data_folder is None:
                        app_config.data_folder = os.path.join(ROOT_DIRECTORY,"logs")
                    if app_config.workcell is None:
                        app_config.workcell = "workcell_1"
                        logging.warning("Workcell not specified.. Using default workcell_1")
                    self.app_config = app_config
                except json.JSONDecodeError as e:
                    logging.error(f"Encountered errored while loading config file {e}")

    def serialize(self, obj:t.Any) -> t.Any:
        """JSON serializer for objects not serializable by default json code"""

        if isinstance(obj, date):
            serial = obj.isoformat()
            return serial

        if isinstance(obj, time):
            serial = obj.isoformat()
            return serial
        return obj.__dict__
    
    def load_workcell_config(self)-> None:
        if self.app_config.data_folder is None:
            self.app_config.data_folder = "logs"

        selected_workcell = get_selected_workcell()
        workcells = get_all_workcells()
        if workcells is None:
            logging.error("Failed to load workcells")
            return None
        selected_workcell_config  = [workcell for workcell in workcells if workcell.get("name") == selected_workcell][0]
        if selected_workcell:
            self.workcell_config = WorkcellConfig.parse_obj(selected_workcell_config)
            self.workcell_config_is_valid = True
        return None
    

    def __str__(self) -> str:
        #Use for debugging
        return f"Config(data_folder_dir={self.app_config.data_folder}, workcell={self.app_config.workcell})"
