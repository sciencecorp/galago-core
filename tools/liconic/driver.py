from dataclasses import dataclass
from datetime import datetime
import logging
import os
import threading
import time
from typing import Optional, Union, Dict

import serial

from tools.base_server import ABCToolDriver
from tools.toolbox.slack import Slack
from tools.app_config import Config

@dataclass
class LiconicConfig:
    """Configuration settings for Liconic STX driver"""
    baud_rate: int = 9600
    timeout: int = 1
    parity: str = serial.PARITY_EVEN
    wait_timeout: int = 90
    max_read_attempts: int = 25
    co2_check_interval: int = 300  # seconds
    co2_low_threshold: float = 3.0
    co2_normal_threshold: float = 4.0

class LiconicError(Exception):
    """Base exception for Liconic-specific errors"""
    pass

class LiconicTimeoutError(LiconicError):
    """Raised when a command times out"""
    pass

class LiconicCommunicationError(LiconicError):
    """Raised when communication with the device fails"""
    pass

class LiconicResponseError(LiconicError):
    """Raised when an unexpected response is received"""
    pass

class SerialCommunication:
    """Handles low-level serial communication with the Liconic device"""
    
    ERROR_CODES: Dict[str, str] = {
        "06163": "Failed to load plate. There might be a plate at specified location."
    }

    def __init__(self, port: str, config: LiconicConfig):
        self.serial_port = serial.Serial(
            port,
            config.baud_rate,
            timeout=config.timeout,
            parity=config.parity
        )
        self.lock = threading.Lock()
        self.config = config

    @staticmethod
    def _try_ascii_decode(data: Union[str, bytes]) -> str:
        if isinstance(data, str):
            return data
        try:
            return data.decode("ascii")
        except Exception as e:
            raise LiconicCommunicationError(f"Error decoding to ASCII string: {data!r}") from e

    def write(self, message: str) -> None:
        with self.lock:
            try:
                self.serial_port.write((message + "\r").encode("ascii"))
            except Exception as e:
                raise LiconicCommunicationError(f"Failed to communicate with Liconic: {e}")

    def read(self, strict: bool = True) -> str:
        attempt = 0
        while attempt < self.config.max_read_attempts:
            with self.lock:
                reply = self.serial_port.read_until(expected=b"\n")
                reply_string = self._try_ascii_decode(reply)

            if not reply_string:
                logging.warning("Liconic STX returned empty response")
                attempt += 1
                logging.info(f"Retrying...Attempt {attempt}")
                continue

            if not (reply_string.endswith("\r\n")):
                logging.warning(f"Liconic STX returned malformed response {reply_string}")
                attempt += 1
                continue

            return reply_string[:-2]  # Remove \r\n

        if strict:
            raise LiconicCommunicationError(
                f"No valid data received. {self.serial_port.name} may have disconnected."
            )
        return ''

    def close(self) -> None:
        self.serial_port.close()

class CO2Monitor:
    """Handles CO2 monitoring and logging functionality"""

    def __init__(self, driver: 'LiconicStxDriver'):
        self.driver = driver
        self.config = driver.config
        self.serial_comm = driver.serial_comm
        self.monitoring = False
        self.co2_out_of_range = False
        self.monitor_thread: Optional[threading.Thread] = None

    def start_monitoring(self) -> None:
        self.monitor_thread = threading.Thread(target=self._monitor_co2_level)
        self.monitor_thread.daemon = True
        self.monitor_thread.start()

    def _monitor_co2_level(self) -> None:
        self.monitoring = True
        try:
            while True:
                logging.info("Liconic monitor thread is running...")
                if not self.driver.is_busy:
                    co2_level = self._get_current_co2_level()
                    self._write_co2_log(co2_level)
                    self._check_co2_alerts(co2_level)
                time.sleep(self.driver.config.co2_check_interval)
        except Exception as e:
            logging.error(f"CO2 monitor thread error: {e}", exc_info=True)
            self.monitoring = False

    def _get_current_co2_level(self) -> float:
        raw_level = float(self.driver.get_co2_cur_level())
        return raw_level / 100

    def _write_co2_log(self, co2_level: float) -> None:
        if not self.driver.co2_log_path:
            return

        today = datetime.today().strftime('%Y-%m-%d')
        today_folder = os.path.join(self.driver.co2_log_path, today)
        os.makedirs(today_folder, exist_ok=True)
        
        trace_file = os.path.join(today_folder, "liconic_co2.txt")
        try:
            if not os.path.exists(trace_file):
                with open(trace_file, 'w+') as f:
                    f.write('Time,Value\n')
            
            with open(trace_file, 'a') as f:
                f.write(f"{datetime.today()},{co2_level}\n")
        except Exception as e:
            logging.error(f"Failed to write CO2 log: {e}")

    def _check_co2_alerts(self, co2_level: float) -> None:
        if co2_level < self.driver.config.co2_low_threshold:
            self.co2_out_of_range = True
            error_message = f"CO2 level is low: {co2_level}%"
            logging.error(error_message)
            self.driver._send_slack_alert(error_message)
        elif co2_level > self.driver.config.co2_normal_threshold and self.co2_out_of_range:
            if self.config.app_config.slack_error_channel:
                self.driver.slack_client.clear_last_error(
                    self.config.app_config.slack_error_channel
                )
            self.co2_out_of_range = False

class LiconicStxDriver(ABCToolDriver):
    """Main driver class for Liconic STX instrument"""

    def __init__(self, com_port: str) -> None:
        self.config = Config()
        self.config.load_app_config()
        self.config.load_workcell_config()
        self.slack_client = Slack(self.config)
        
        self.liconic_config = LiconicConfig()
        self.serial_comm = SerialCommunication(com_port, self.liconic_config)
        self.co2_monitor = CO2Monitor(self)
        
        self.is_busy = False
        self.co2_log_path = None
        if self.config.app_config.data_folder:
            self.co2_log_path = os.path.join(
                self.config.app_config.data_folder,
                "sensors",
                "liconic"
            )
        
        self.connect()

    def connect(self) -> None:
        logging.info("Connecting to Liconic STX...")
        self.serial_comm.write("CR")
        self._expect_response("CC")

    def close(self) -> None:
        logging.info("Closing Liconic STX connection...")
        self.serial_comm.write("CQ")
        self._expect_response("CF")
        self.serial_comm.close()

    def _expect_response(self, expected: str, strict: bool = False) -> None:
        response = self.serial_comm.read()
        if response != expected:
            if strict:
                raise LiconicResponseError(f"Expected response {expected}. Got {response}")
            logging.warning(f"Expected response {expected}. Got {response}")

    def _send_slack_alert(self, error_message: str) -> None:
        workcell = self.config.app_config.workcell or "Unknown"
        if self.config.app_config.slack_error_channel:
            self.slack_client.send_alert_slack(
                workcell=workcell,
                tool="Liconic",
                protocol="NA",
                error=error_message,
                channel_id=self.config.app_config.slack_error_channel
            )

    def wait_for_ready(self, timeout: int = None, custom_error: Optional[str] = None) -> None:
        timeout = timeout or self.liconic_config.wait_timeout
        elapsed_time = 0
        
        while True:
            self.serial_comm.write("RD 1915")
            if self.serial_comm.read() == "1":
                logging.info(f"Device ready after {elapsed_time} seconds")
                return

            if self.has_error():
                error_code = self.get_error_code()
                error_message = self.serial_comm.ERROR_CODES.get(
                    error_code,
                    f"Unknown error code: {error_code}"
                )
                raise LiconicError(error_message)

            logging.info("Liconic STX is busy. Waiting...")
            elapsed_time += 1
            
            if elapsed_time > timeout:
                raise LiconicTimeoutError(
                    custom_error or "Liconic timed out waiting for command"
                )
            
            time.sleep(1)

    def load_plate(self, cassette: int, level: int) -> None:
        logging.info(f"Loading plate (cassette={cassette}, level={level})...")
        self.is_busy = True
        try:
            self._execute_plate_operation("load", cassette, level)
        finally:
            self.is_busy = False
            logging.info("Loading plate complete")

    def unload_plate(self, cassette: int, level: int) -> None:
        logging.info(f"Unloading plate (cassette={cassette}, level={level})...")
        self.is_busy = True
        try:
            self._execute_plate_operation("unload", cassette, level)
        finally:
            self.is_busy = False
            logging.info("Unloading plate complete")

    def _execute_plate_operation(self, operation: str, cassette: int, level: int) -> None:
        self.serial_comm.write(f"WR DM0 {cassette}")
        self._expect_response("OK")
        self.serial_comm.write(f"WR DM5 {level}")
        self._expect_response("OK")
        
        command = "1904" if operation == "load" else "1905"
        self.serial_comm.write(f"ST {command}")
        self._expect_response("OK")

        self.wait_for_ready()
        self.check_shovel_station_sensor("0")
        expected_transfer = "0" if operation == "load" else "1"
        self.check_transfer_station_sensor(expected_transfer)

    def has_error(self) -> bool:
        self.serial_comm.write("RD 1814")
        return self.serial_comm.read() == "1"

    def get_error_code(self) -> str:
        self.serial_comm.write("RD DM200")
        return self.serial_comm.read()

    def check_transfer_station_sensor(self, expected: str = "0") -> None:
        self.serial_comm.write("RD 1813")
        self._expect_response(expected)

    def check_shovel_station_sensor(self, expected: str = "0") -> None:
        self.serial_comm.write("RD 1812")
        self._expect_response(expected)

    # CO2 Control Methods
    def get_co2_set_point(self) -> str:
        self.serial_comm.write("RD DM894")
        return self.serial_comm.read()

    def set_co2_set_point(self, level: float) -> None:
        self.serial_comm.write(f"WR DM894 {str(int(level * 100)).zfill(5)}")
        self._expect_response("OK")

    def get_co2_cur_level(self) -> str:
        self.serial_comm.write("RD DM984")
        return self.serial_comm.read()

    def start_monitor(self) -> None:
        self.co2_monitor.start_monitoring()

    # Utility Methods
    def reset(self) -> None:
        logging.info("Resetting Liconic STX...")
        self.serial_comm.write("ST 1900")
        self._expect_response("OK")
        self.wait_for_ready()

    def initialize(self) -> None:
        logging.info("Initializing Liconic STX...")
        self.serial_comm.write("ST 1801")
        self._expect_response("OK")
        self.wait_for_ready()

    def show_cassette(self, cassette: int) -> None:
        rotate_to_cassette = (cassette - 3) % 10
        self.serial_comm.write(f"WR DM0 {rotate_to_cassette}")
        self._expect_response("OK")
        self.wait_for_ready()

    def raw(self, message: str) -> None:
        self.serial_comm.write(message)
        response = self.serial_comm.read()
        logging.info(f"Raw command response: {response}")