import typing as t
from typing import Optional, Any, List, Union, Dict
import threading
import requests
import os
import json
# import warnings as warn
from tools.base_server import ABCToolDriver
import shutil
import logging
from pathlib import Path
from biology_tools.records.data import DATA_TYPE_RECORDS  # type: ignore
from biology_tools.records.base import DataObjectRecord  # type: ignore
from biology_tools.helix_api import HelixApiClient
from biology_tools.records import bio as rc
from tools.grpc_interfaces.tool_base_pb2 import INVALID_ARGUMENTS, SUCCESS
from .helper_functions import put_bulk_update_well_notes, generate_well_coords,attach_culture_to_well_plate, post_note_to_well_by_index
from tools.toolbox.slack import Slack
from tools.app_config import Config 
import time 

config = Config()
config.load_app_config()
slack_active= True

class HelixClientDriver(ABCToolDriver):
    def __init__(
        self,
        base_path: Optional[str] = None,
        path: Optional[str] = None,
        inventory_base_path: Optional[str] = None,
        cytation_raw_data_directory: Optional[str] = None,
        synology_directory: Optional[str] = None,
        tool_id: Optional[str] = None
        # slack_channel: Optional[str] = None,
    ) -> None:
        app_config = Config()
        app_config.load_app_config()
        self.base_path: str = base_path or "https://app.science.xyz/api"
        self.path: str = path or ""
        self.slack_channel: str = config.app_config.slack_workcell_channel # type: ignore
        self.slack_token: str = config.app_config.slack_bot_tocken # type: ignore
        self.inventory_base_path: str = f"http://{app_config.app_config.host_ip}:8000" or "http://127.0.0.1:8000"
        self.cytation_raw_data_directory: Path = Path(cytation_raw_data_directory or "")
        self.threshold: int = 50
        self.synology_directory: Path = Path(
            synology_directory or "H:/SynologyDrive/Helix/cultures/"
        )
        self.helix_client = HelixApiClient()
        self.tool_id = tool_id
        self.slack_client = Slack(config)

    def post_todo(self, todo_id: str) -> Any:
        url = f"{self.base_path}/todos/{todo_id}"
        headers = {"Content-Type": "application/json"}

        try:
            response = requests.put(
                url,
                json={"todo": {"update_state": "complete"}},
                headers=headers,
                timeout=15,
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException:
            print(f"Unable to post todo to {url}")
            # self.slack_client.slack_message(
            #     recipient=self.slack_channel,
            #     message=f"Unable to post todo to {url}\n",
            # )
    def upload_data_to_synology(
        self, local_directory: str, synology_directory: str
    ) -> None:
        logging.debug("Uploading data to the Synology server...")

        if not os.path.exists(local_directory):
            raise Exception(f"Local directory {local_directory} does not exist.")

        if not os.path.isdir(local_directory):
            raise Exception(f"{local_directory} is not a valid directory.")

        if not os.path.exists(synology_directory):
            os.mkdir(synology_directory)
        else:
            logging.debug(f"Synology directory {synology_directory} already exists.")

        # Iterate over files and subdirectories in the local directory and copy them individually.
        for item in os.listdir(local_directory):
            source_item = os.path.join(local_directory, item)
            destination_item = os.path.join(synology_directory, item)

            if os.path.isdir(source_item):
                shutil.copytree(source_item, destination_item)
            else:
                shutil.copy2(source_item, destination_item)

    def post_measurement(self, measurement_data: str) -> Any:
        url = f"{self.base_path}/measurements"
        headers = {"Content-Type": "application/json"}

        try:
            response = requests.post(
                url, json=measurement_data, headers=headers, timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Unable to post measurement to {url}") from e

    def update_consumables(self, reagent_ids: t.Iterable[int]) -> None:
        """Delete each reagent_id from the inventory database."""
        for reagent_id in reagent_ids:
            url = f"{self.inventory_base_path}/reagents/{reagent_id}"
            try:
                response = requests.delete(url, timeout=10)
                response.raise_for_status()
            except requests.exceptions.RequestException as e:
                raise Exception(
                    f"Unable to delete reagent with id {reagent_id} from {url}"
                ) from e
            
    

    def upload_cytation_images_to_synology(self, culture_id: int) -> None:
        """Look for files and directories that contain culture id in name"""
        logging.debug("Uploading cytation images to the Synology server...")
        if not os.path.isdir(self.cytation_raw_data_directory):
            raise Exception(
                f"Cytation directory {self.cytation_raw_data_directory} does not exist."
            )
        if not os.path.isdir(self.synology_directory):
            raise Exception(
                f"Synology directory {self.synology_directory} does not exist."
            )
        destination_directory: Path = self.synology_directory / str(culture_id)
        print("destination_directory", destination_directory)
        print("self.cytation_raw_data_directory", self.cytation_raw_data_directory)
        logging.debug(f"Copying cytation data to {destination_directory}")

        if not os.path.isdir(destination_directory):
            os.mkdir(destination_directory)

        # Function to copy a file or directory while preserving existing files/folders
        def copy_item(source_item:Path, destination_directory: Path) -> None:
            destination_item = destination_directory / source_item.name
            if source_item.is_dir():
                if not destination_item.exists():
                    shutil.copytree(source_item, destination_item)
                else:
                    # If the destination directory already exists, merge the contents
                    for item in source_item.iterdir():
                        copy_item(item, destination_item)
            else:
                # Check if the destination file already exists
                while destination_item.exists():
                    # Append a unique suffix to the destination file name
                    stem, extension = os.path.splitext(destination_item.name)
                    destination_item = destination_directory / f"{stem}_copy{extension}"

                shutil.copy2(source_item, destination_item)

        # Copy items from source to destination
        source_directory = self.cytation_raw_data_directory / str(culture_id)
        for item in source_directory.iterdir():
            copy_item(item, destination_directory)
                

    def post_data_object(
        self,
        data_type: str,
        object_data: Optional[dict] = None,
        files: Optional[List[Any]] = None,
        val_only: bool = False,
    ) -> dict:
        files = files or []
        object_data = object_data or {}

        response: Dict[str, Any] = {}
        response["return_reply"] = True
        response["response"] = SUCCESS
        response["error_message"] = ""

        try:
            data_obj_record_cls = DATA_TYPE_RECORDS.get(data_type)
            if not data_obj_record_cls:
                response[
                    "error_message"
                ] = f"Validation Error: Unknown data type in Helix Tool: {data_type}"
                response["response"] = INVALID_ARGUMENTS
                return response

            record = data_obj_record_cls.from_helixtool(
                data_type=data_type, object_data=object_data, files=files
            )
            # check for Cytation data_type
            #postConfluenceNotes(self,record.id,object_data['confluence_notes'])


        except Exception as exc:
            response["error_message"] = f"{repr(exc)}"
            response["response"] = INVALID_ARGUMENTS
            return response

        if not val_only:
            self._PostDataObject(record)

        return response

    def post_data_object_from_local_directory(
        self,
        dirpath: Union[str, Path],
        data_type: str,
        object_data: Optional[dict] = None,
        val_only: bool = False,
    ) -> dict:
        object_data = object_data or {}

        response: Dict[str, Any] = {}
        response["return_reply"] = True
        response["response"] = SUCCESS

        logging.info(f"Posting DataObject ({data_type}) from local directory: {dirpath}")
        logging.info(f"Data type: {data_type}")
        logging.info(f"Validation only: {val_only}")
        logging.info(f"Object Data: {object_data}")

        try:
            data_obj_record_cls = DATA_TYPE_RECORDS.get(data_type)
            logging.info(f"Data object record is {data_obj_record_cls}")
            if not data_obj_record_cls:
                response[
                    "error_message"
                ] = f"Validation Error: Unknown data type in Helix Tool: {data_type}"
                response["response"] = INVALID_ARGUMENTS
                logging.error(response["error_message"])
                return response

            record = data_obj_record_cls.from_directory(
                dirpath=dirpath,
                object_data=object_data,
            )

            logging.info(f"Record result is {record}")
        except Exception as exc:
            response["error_message"] = f"{repr(exc)}"
            response["response"] = INVALID_ARGUMENTS
            logging.error(response["error_message"])
            return response

        if not val_only:
            self._PostDataObject(record)

        clean_json_record = json.loads(record.json(exclude_none=True))
        response["error_message"] = f"{clean_json_record}"
        logging.debug(response["error_message"])

        return response

    def _PostDataObject(self, record: DataObjectRecord) -> None:
        logging.debug(f"PostDataObject to Helix started: {record.data_type}\n")

        def _post_data_object(record: DataObjectRecord) -> None:
            logging.debug(f"_post_data_object to Helix started: {record.data_type}\n")
            if not record:
                raise Exception("Record is None")
            if self.slack_channel:
                self.slack_client.slack_message(
                    recipient=self.slack_channel,
                    message=f":arrow_up: PostDataObject to Helix started: {record.data_type}\n",
                )
            logging.debug(f"PostDataObject to Helix started: {record.data_type}\n")
            logging.debug(f"File name: {record.data_object_files[0].file_data['metadata']['filename']}")
            if record.data_type == "cytation" and "384well_confluence_sciclone" in record.data_object_files[0].file_data['metadata']['filename']:
                logging.info("384well_confluence_sciclone file detected")
                put_bulk_update_well_notes(self,dataObjectID=record.id,threshold=self.threshold)
            record.to_helix()
            resp = DataObjectRecord.from_helix(record_id=record.id)

            if isinstance(resp, DataObjectRecord):
                record = resp
                message = record.url
            else:
                message = f"Status Code: {resp.status_code}: {resp.reason}"
            if self.slack_channel:
                self.slack_client.slack_message(
                recipient=self.slack_channel,
                    message=f":ballot_box_with_check: PostDataObject to Helix finished: {message}",
                )
            
        thread = threading.Thread(
            target=_post_data_object,
            name=f"postdataobject_{record.data_type}_{record.id}",
            args=(record,),
        )
        thread.start()
        #_post_data_object(record)
        logging.info(f"Post DataObject to Helix ({record.data_type}: Thread started...")

    
    def post_note_to_helix(self, culture_id:int, well:int, note:str) -> None:
        post_note_to_well_by_index(self,culture_id,well,note)
    
    def passage_culture(self,culture_id:int, well_plate_id: int, mark_dead:bool, plate_type:int) -> None:
        culture = rc.CultureRecord.from_helix(culture_id)
        child_culture = culture.create_child(inherit_parent_properties=True, reset_div_to_0=True)
        resp = child_culture
        child_culture_id = resp.json()[0]['id']
        well_coords = generate_well_coords(plate_type)
        attach_culture_to_well_plate(well_plate_id=well_plate_id, culture_id=child_culture_id, well_coords=well_coords)


if __name__ == "__main__":

    d = HelixClientDriver()
    object_data = {
        "well_plate_id" : "7443",
        "cytation_protocol":"384well_PC_confluence.prt",
        "acquired_at": str(int(time.time()))
    }
    d.post_data_object_from_local_directory(dirpath="C://cytation_experiments//384well_4x_colony_tracker_PC_7443_",data_type="Cytation", object_data=object_data, val_only=False)