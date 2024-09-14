
import os
from os.path import join, dirname
from pydantic import BaseModel
from tools.workcell_config import WorkcellConfig 
import json 
from typing import Optional
from datetime import date , time 
import logging 
import typing as t

ROOT_DIRECTORY = dirname(dirname(os.path.realpath(__file__)))
APP_CONFIG_FILE = join(ROOT_DIRECTORY, "app_config.json")
WORKSPACE = join(ROOT_DIRECTORY, "workspace")

class AppConfig(BaseModel):
    workcell_config_file :Optional[str] 
    data_folder:Optional[str]
    host_ip: Optional[str] 
    redis_ip: Optional[str] 
    enable_slack_errors: bool 
    slack_bot_tocken: Optional[str]
    slack_workcell_channel: Optional[str]
    slack_error_channel: Optional[str]
    slack_admins_ids: Optional[list[str]]
    liconic_sensor_folder: Optional[str]
    landing_ai_key:Optional[str]
    
class Config():
    def __init__(self) -> None:
        self.workcell_config : Optional[WorkcellConfig] = None
        self.app_config : AppConfig
        self.workcell_config_is_valid = False
        
    def load_app_config(self) -> None:
        if not os.path.exists(APP_CONFIG_FILE):
            self.app_config = AppConfig(
                workcell_config_file=None,
                data_folder=None,
                host_ip="localhost",
                redis_ip="127.0.0.1:6379",
                enable_slack_errors=False,
                slack_admins_ids=None,
                slack_workcell_channel=None,
                slack_error_channel=None,
                slack_bot_tocken=None,
                liconic_sensor_folder = None,
                landing_ai_key = None
            )
            json_config = self.app_config.__dict__
            with open(APP_CONFIG_FILE, 'w') as f:
                json.dump(json_config, f, indent=4)
        else:
            with open(APP_CONFIG_FILE) as f:
                try:
                    config = json.load(f)
                    self.app_config = AppConfig.parse_obj(config)
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
        if self.app_config.workcell_config_file is None:
            self.workcell_config_is_valid = False
            logging.warning("No workcell config file specified.")
            return None
        real_path = join(ROOT_DIRECTORY, "workspace","workcells", self.app_config.workcell_config_file, f"{self.app_config.workcell_config_file}.json")
        if not os.path.exists(real_path):
            self.workcell_config_is_valid = False
            logging.warning("Specified workcell config file does not exist")
            return None

        with open(real_path) as f:
            try:
                config = json.load(f)
                self.workcell_config = WorkcellConfig.parse_obj(config)
                self.workcell_config_is_valid = True
            except Exception as e:
                raise RuntimeError(f"Failed to load workcell config file {e}")
            
        return None
    def __str__(self) -> str:
        #Use for debugging
        return f"Config(data_folder_dir={self.app_config.data_folder}, workcell_config_file={self.app_config.workcell_config_file})"
