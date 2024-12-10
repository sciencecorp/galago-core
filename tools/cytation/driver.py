import os
import datetime
import logging
import time
import traceback
import shutil
import xml.etree.ElementTree as ET
import queue
import threading
from dataclasses import dataclass
from typing import Union, Optional, Any, List
from tools.base_server import ABCToolDriver

try:
    import pythoncom
    import win32com.client as win32
except ImportError:
    pass

@dataclass
class CytationConfig:
    """Configuration settings for the Cytation driver"""
    protocol_dir: str = "C:\\cytation\\protocols"
    experiment_dir: str = "C:\\cytation_output"
    reader_type: Union[str, int] = 21  # CYTATION5_READER_TYPE

class CytationCommand:
    """Represents a command to be executed by the Cytation device"""
    def __init__(self, command: str, params: dict[str, Any] = None):
        self.command = command
        self.params = params or {}

class CytationResponse:
    """Represents a response from the Cytation device"""
    def __init__(self, command: str, response: Optional[Union[str, int]]):
        self.command = command
        self.response = response

class CytationExperiment:
    """Handles experiment-related operations"""
    def __init__(self, app: Any, protocol_dir: str, experiment_dir: str):
        self.app = app
        self.protocol_dir = protocol_dir
        self.experiment_dir = experiment_dir

    def create_experiment(self, protocol_file: str, experiment_name: str = "") -> tuple[Any, Any, str]:
        """Creates a new experiment and returns the experiment object, plate, and name"""
        if not protocol_file.endswith(".prt"):
            protocol_file = f"{protocol_file}.prt"

        date = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        experiment_name = experiment_name or f"auto_{protocol_file}_{date}"

        protocol_path = os.path.join(self.protocol_dir, protocol_file)
        experiment_path = os.path.join(self.experiment_dir, experiment_name, f"{experiment_name}.xpt")
        
        # Handle long path names
        if len(experiment_path) > 250:
            experiment_path = f"{experiment_path[:240]}.xpt"

        experiment = self.app.NewExperiment(protocol_path)
        experiment.SaveAs(experiment_path)
        plate = experiment.plates.GetPlate(1)

        return experiment, plate, experiment_name

    def set_well_addresses(self, plate: Any, well_addresses: List[str]) -> None:
        """Configures which wells to image"""
        if not well_addresses:
            return

        xml_string = (
            '<BTIPartialPlate Version="1.00"><SingleBlock>No</SingleBlock><Wells>' +
            "".join(f"<Well>{well}</Well>" for well in well_addresses) +
            "</Wells></BTIPartialPlate>"
        )
        plate.SetPartialPlate(xml_string)

class CytationOutput:
    """Handles output and data saving operations"""
    def __init__(self, experiment_dir: str):
        self.experiment_dir = experiment_dir

    def save_picture_builders(self, plate: Any, experiment_name: str) -> None:
        """Saves picture builder outputs"""
        picture_builder_names = win32.VARIANT(pythoncom.VT_VARIANT | pythoncom.VT_BYREF, [])
        plate.GetPictureExportNames(False, picture_builder_names)

        for picture_builder in picture_builder_names.value:
            xml_response = plate.PictureExport(picture_builder)
            self._process_picture_export(xml_response, experiment_name)

    def _process_picture_export(self, xml_response: str, experiment_name: str) -> None:
        """Process and move picture export files to the correct location"""
        root = ET.fromstring(xml_response)
        save_dir = root.findall("Folder")[0].text
        image_name = root.findall("Image")[0].text

        if save_dir:
            new_dir = os.path.join(self.experiment_dir, experiment_name, image_name)
            os.makedirs(new_dir, exist_ok=True)

            for file_element in root.findall("PictureFile"):
                filename = file_element.text
                shutil.move(
                    os.path.join(save_dir, filename),
                    os.path.join(new_dir, filename)
                )

    def save_export_builders(self, plate: Any, experiment_name: str) -> None:
        """Saves export builder outputs"""
        export_builder_names = win32.VARIANT(pythoncom.VT_VARIANT | pythoncom.VT_BYREF, [])
        plate.GetFileExportNames(False, export_builder_names)

        for export_builder in export_builder_names.value:
            output_path = os.path.join(
                self.experiment_dir,
                experiment_name,
                f"{experiment_name}_{export_builder}.csv"
            )
            plate.FileExportEx(export_builder, output_path)

    def move_raw_data(self, plate: Any, experiment_name: str) -> None:
        """Moves raw data to the experiment output folder"""
        raw_image_output_folders = win32.VARIANT(pythoncom.VT_VARIANT | pythoncom.VT_BYREF, [])
        plate.GetImageFolderPaths(raw_image_output_folders)
        
        if not raw_image_output_folders.value:
            return

        image_exp_dirname = os.path.dirname(os.path.dirname(raw_image_output_folders.value[0]))
        target_dir = os.path.join(self.experiment_dir, experiment_name)
        
        if image_exp_dirname != target_dir:
            folder_name = os.path.basename(os.path.dirname(raw_image_output_folders.value[0]))
            shutil.move(
                os.path.dirname(raw_image_output_folders.value[0]),
                os.path.join(target_dir, folder_name)
            )

class CytationDriver(ABCToolDriver):
    """Main driver class for controlling the Cytation device"""
    def __init__(self, config: Optional[CytationConfig] = None) -> None:
        self.config = config or CytationConfig()
        self._command_lock = threading.Lock()
        self.command_queue: queue.Queue = queue.Queue()
        self.command_response_queue: queue.Queue = queue.Queue()
        self.live = False
        self.live_message = ""
        self.execution_thread: Optional[threading.Thread] = None
        self._setup_output_directories()
        self.start()

    def _setup_output_directories(self) -> None:
        """Ensures required directories exist"""
        os.makedirs(self.config.experiment_dir, exist_ok=True)
        os.makedirs(self.config.protocol_dir, exist_ok=True)

    def start(self) -> None:
        """Starts the Cytation driver"""
        self.kill_processes("Gen5.exe")
        self.live = True
        self.live_message = ""
        self.execution_thread = threading.Thread(target=self._execute_cytation_commands)
        self.execution_thread.daemon = True
        self.execution_thread.start()

    def _execute_cytation_commands(self) -> None:
        """Main command execution loop"""
        logging.info("Starting cytation command thread")
        try:
            pythoncom.CoInitialize()
            app = win32.Dispatch("Gen5.Application")
            app.ConfigureUSBReader(self.config.reader_type, "")
            
            experiment_handler = CytationExperiment(app, self.config.protocol_dir, self.config.experiment_dir)
            output_handler = CytationOutput(self.config.experiment_dir)

            while self.live:
                self._process_command_queue(app, experiment_handler, output_handler)
                time.sleep(0.25)

        except Exception as e:
            self._handle_execution_error(e)

    def _process_command_queue(self, app: Any, experiment_handler: CytationExperiment, 
                             output_handler: CytationOutput) -> None:
        """Processes commands in the queue"""
        while not self.command_queue.empty():
            with self._command_lock:
                command_obj = self.command_queue.get()
                
            response = self._execute_command(
                app, command_obj["command"], command_obj["params"],
                experiment_handler, output_handler
            )
            
            with self._command_lock:
                self.command_response_queue.put(
                    {"command": command_obj["command"], "response": response}
                )

    def _execute_command(self, app: Any, command: str, params: dict[str, Any],
                        experiment_handler: CytationExperiment,
                        output_handler: CytationOutput) -> Optional[int]:
        """Executes a single command"""
        logging.info(f"Executing command {command}")

        if command == "start_read":
            return self._handle_start_read(app, params, experiment_handler, output_handler)
        elif command == "open_carrier":
            app.CarrierOut()
        elif command == "close_carrier":
            app.CarrierIn()
        elif command == "test_reader_communication":
            return app.TestReaderCommunication

        return None

    def _handle_start_read(self, app: Any, params: dict[str, Any],
                          experiment_handler: CytationExperiment,
                          output_handler: CytationOutput) -> None:
        """Handles the start_read command"""
        experiment, plate, experiment_name = experiment_handler.create_experiment(
            params["protocol_file"], params["experiment_name"]
        )

        if params.get("well_addresses"):
            experiment_handler.set_well_addresses(plate, params["well_addresses"])

        self._monitor_read_progress(plate)

        output_handler.save_picture_builders(plate, experiment_name)
        output_handler.save_export_builders(plate, experiment_name)
        # Uncomment if raw data moving is needed
        # output_handler.move_raw_data(plate, experiment_name)

    def _monitor_read_progress(self, plate: Any) -> None:
        """Monitors the progress of a plate read"""
        monitor = plate.StartRead
        time.sleep(5)  # Allow ReadInProgress flag to set

        times = 0
        while monitor.ReadInProgress and self.live:
            if times % 60 == 0:
                logging.info("Cytation read in progress...")
            times += 1
            time.sleep(1)

        logging.info("Cytation read complete...")

    def _handle_execution_error(self, error: Exception) -> None:
        """Handles errors in the execution thread"""
        logging.warning("Cytation command thread has errored")
        logging.error(traceback.format_exc())
        self.live = False
        self.live_message = str(error)
        pythoncom.CoUninitialize()

    # Public interface methods
    def start_read(self, protocol_file: str, experiment_name: str = "",
                  well_addresses: Optional[List[str]] = None) -> None:
        """Starts a plate read"""
        self.schedule_command(
            "start_read",
            {
                "protocol_file": protocol_file,
                "experiment_name": experiment_name,
                "well_addresses": well_addresses,
            },
        )
        self.wait_for_command("start_read")

    def open_carrier(self) -> None:
        """Opens the plate carrier"""
        self.schedule_command("open_carrier")
        self.wait_for_command("open_carrier")

    def close_carrier(self) -> None:
        """Closes the plate carrier"""
        self.schedule_command("close_carrier")
        self.wait_for_command("close_carrier")

    def verify_reader_communication(self) -> None:
        """Verifies communication with the reader"""
        reader_state = self._test_reader_communication()
        if reader_state != 1:
            raise Exception(f"Expected reader state 1. Got {reader_state}")

    def _test_reader_communication(self) -> Optional[Union[str, int]]:
        """Tests communication with the reader"""
        self.schedule_command("test_reader_communication")
        return self.wait_for_command("test_reader_communication", timeout=8)

    def schedule_command(self, command: str, params: dict[str, Any] = None) -> None:
        """Schedules a command for execution"""
        logging.info(f"Scheduling command {command}, {params}")
        with self._command_lock:
            self.command_queue.put({"command": command, "params": params or {}})

    def wait_for_command(self, command: str, timeout: Optional[int] = None) -> Optional[Union[str, int]]:
        """Waits for a command to complete"""
        start_time = time.time()
        times = 0

        while self.live:
            seconds_spent_waiting = int(time.time() - start_time)
            if timeout and seconds_spent_waiting > timeout:
                raise Exception(f"Command {command} has timed out. Please reset the driver.")

            if not self.command_response_queue.empty():
                with self._command_lock:
                    command_obj = self.command_response_queue.get()
                    if command_obj["command"] == command:
                        logging.info(f"Command {command} completed. Waited {seconds_spent_waiting}s")
                        return command_obj["response"]
                    logging.warning(f"Unexpected command {command_obj['command']} received")

            times += 1
            if times % 60 == 0:
                logging.info(f"Waiting for Cytation {command} command...({seconds_spent_waiting}s)")
            time.sleep(1)

        if not self.live:
            raise Exception(f"Cytation driver has crashed. Please reset the driver. {self.live_message}")
        return None

    def close(self) -> None:
        """Closes the driver"""
        self.live = False
        if hasattr(self, 'execution_thread') and self.execution_thread:
            self.execution_thread.join()

    def __del__(self) -> None:
        """Cleanup when the driver is destroyed"""
        if hasattr(self, 'live') and self.live:
            self.close()