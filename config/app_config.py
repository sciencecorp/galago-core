import os
from os.path import join, dirname
from pydantic import BaseModel
from .workcell_config import WorkcellConfig 
import json 
from typing import Optional
from datetime import date , time 
import logging 
import typing as t

ROOT_DIRECTORY = dirname(dirname(os.path.realpath(__file__)))
APP_CONFIG_FILE = join(ROOT_DIRECTORY, "app_config.json")

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
        if self.app_config.workcell is None:
            logging.warning("Workcell not specified")
            return None
        workcell_path = join(self.app_config.data_folder,"workcells",f"{self.app_config.workcell}.json")
        if not os.path.exists(workcell_path):
            self.workcell_config_is_valid = False
            logging.warning("Specified workcell config file does not exist")
            return None

        with open(workcell_path) as f:
            try:
                config = json.load(f)
                self.workcell_config = WorkcellConfig.parse_obj(config)
                self.workcell_config_is_valid = True
            except Exception as e:
                raise RuntimeError(f"Failed to load workcell config file {e}")
        self.workcell_config_file = os.path.abspath(workcell_path)
        return None
    def __str__(self) -> str:
        #Use for debugging
        return f"Config(data_folder_dir={self.app_config.data_folder}, workcell={self.app_config.workcell})"
