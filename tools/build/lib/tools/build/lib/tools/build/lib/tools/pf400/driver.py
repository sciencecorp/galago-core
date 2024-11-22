"""
    Error codes.
    -1009 = No robot attached.
    -1046 = Power not enabled.
    -1025 = Timeout enabling power.
    -1021 = Robot not homed.
    -1012 = Joint out-of-range.
        This occurs sometimes if you are using Cartesian coordinates, e.g. movec.
"""

import logging
import time

from tools.pf400.tcp_ip import Pf400TcpIp
from tools.base_server import ABCToolDriver
from typing import Optional 

GRASP_PLATE_BUFFER_MM = 10

class Pf400Driver(ABCToolDriver):
    def __init__(self, tcp_host: str, tcp_port: int) -> None:
        self.communicator = Pf400TcpIp(tcp_host, tcp_port)

        # Whether to override the gripper axis.
        # Used to make sure the gripper stays closed no matter what.
        self.gripper_axis_override_value: Optional[int] = None
        self.is_free = False

    def initialize(self) -> None:
        if self.is_plate_gripped():
            logging.info("gripper_axis_override_value detected during initialize")
            logging.info(f"Removing gripper value override {self.gripper_axis_override_value}")
            self.gripper_axis_override_value = None

        self.ensure_pc_mode()
        self.ensure_power_on()
        self.ensure_robot_attached()
        self.ensure_robot_homed(self.get_cur_joint_loc_string())
        self.is_free = False

    def close(self) -> None:
        self.communicator.close()

    # Turn free mode on.
    def free(self) -> None:
        logging.info("Freeing robot...")
        logging.info("This can take a while...")
        self.freemode(axis=0, timeout=15)

    # Turn free mode on, but exclude the gripper axis.
    def safe_free(self) -> None:
        logging.info("Freeing robot, safe mode. (exclude gripper axis 5)...")
        logging.info("This can take a while...")
        self.freemode(axis=1, timeout=15)
        self.freemode(axis=2, timeout=15)
        self.freemode(axis=3, timeout=15)
        self.freemode(axis=4, timeout=15)
        self.freemode(axis=6, timeout=15)
        self.is_free = True

    def unfree(self) -> None:
        logging.info("Unfreeing robot...")
        self.freemode(axis=-1, timeout=10)
        self.is_free = False

    def movej(self, loc_string: str, motion_profile: int = 1) -> None:
        if self.is_free:
            try:
                self.unfree()
            except Exception as e:
                logging.error(f"Failed to unfree arm. {e}")
        # If the plate is grasped, overwrite the joint axis.
        if self.gripper_axis_override_value:
            loc_tokens = loc_string.split(" ")
            loc_tokens[4] = str(round(float(self.gripper_axis_override_value), 3))
            loc_string = " ".join(loc_tokens)

        self.communicator.write_and_expect(f"movej {motion_profile} {loc_string}")
        self.communicator.wait_for_eom()

    def movec(self, loc_string: str, motion_profile: int = 1) -> None:
        if self.is_free:
            try:
                self.unfree()
            except Exception as e:
                logging.error(f"Failed to unfree arm. {e}")
        self.communicator.write_and_expect(f"movec {motion_profile} {loc_string}")
        self.communicator.wait_for_eom()

    def jog(self, axis:str, distance:float) -> None:
        current_loc = self.get_cur_cartesian_loc_tokens()
        new_loc = current_loc.copy()
        if axis == "x":
            new_x = float(current_loc[0]) + distance
            new_loc[0] = str(new_x)
        elif axis == "y":
            new_y = float(current_loc[1]) + distance
            new_loc[1] = str(new_y)
        elif axis == "z":
            new_z = float(current_loc[2]) + distance
            new_loc[2] = str(new_z)
        elif axis == "yaw":
            new_yaw = float(current_loc[3]) + distance
            new_loc[3] = str(new_yaw)
        elif axis == "pitch":
            new_pitch = float(current_loc[4]) + distance
            new_loc[4] = str(new_pitch)
        elif axis == "roll":
            new_roll = float(current_loc[5]) + distance
            new_loc[5] = str(new_roll)
        else:
            raise Exception(f"Invalid axis {axis}")

        self.movec(" ".join(new_loc))
        self.communicator.wait_for_eom()

    def wherej(self) -> str:
        return self.communicator.write_and_read("wherej")

    def wherec(self) -> str:
        return self.communicator.write_and_read("wherec")

    def graspplate(self, plate_width: int, grip_force: int = 10, speed: int = 10) -> None:
        self.gripper_axis_override_value = plate_width - GRASP_PLATE_BUFFER_MM

        self.communicator.write_and_expect(
            f"graspplate {plate_width} {speed} {grip_force}", expected="0 -1"
        )
        self.communicator.wait_for_eom()

    def releaseplate(self, plate_width: int, speed: int = 10) -> None:
        self.gripper_axis_override_value = None
        self.communicator.write_and_expect(f"releaseplate {plate_width} {speed}")
        self.communicator.wait_for_eom()

    def is_plate_gripped(self) -> bool:
        return self.gripper_axis_override_value is not None

    def freemode(self, axis: int = -1, timeout: int = 10) -> None:
        self.communicator.write_and_read(f"freemode {axis}", timeout=timeout)

    def register_motion_profile(self, profile: str) -> None:
        logging.info(f"Registering motion profile {profile}...")
        self.communicator.write_and_read(f"profile {profile}")

    # Location string commands

    def get_cur_joint_loc_tokens(self) -> list[str]:
        location = self.wherej()
        return location.split(" ")[1:]

    def get_cur_joint_loc_string(self) -> str:
        return " ".join(self.get_cur_joint_loc_tokens())

    def get_cur_cartesian_loc_tokens(self) -> list[str]:
        location = self.wherec()
        return location.split(" ")[1:-1]

    def get_cur_cartesian_loc_string(self) -> str:
        return " ".join(self.get_cur_cartesian_loc_tokens())

    # Initialization code.

    def ensure_pc_mode(self) -> None:
        self.communicator.write("mode")
        messages = self.communicator.read_all()

        if len(messages) > 1 or messages[0] != "0 0":
            logging.info("Switching to PC mode...")

            message = self.communicator.write_and_read("mode 0")
            if message != "0":
                raise Exception(f"Could not switch to PC mode. {message}")
            message = self.communicator.write_and_read("mode")
            if message != "0 0":
                raise Exception(f"Could not switch to PC mode. {message}")

            logging.info("Switched to PC mode")

    def ensure_power_on(self) -> None:
        message = self.communicator.write_and_read("hp")
        tokens = message.split(" ")
        if tokens[0] != "0":
            raise Exception(f"Got malformed message when requesting power state. {message}")
        if tokens[1] != "1":
            # Wait 10 seconds for power to come on.
            logging.info("Turning on power...")
            message = self.communicator.write_and_read("hp 1 30")
            if message != "0":
                raise Exception(f"Could not turn power on. {message}")
            message = self.communicator.write_and_read("hp")
            if message != "0 1":
                raise Exception(f"Could not turn power on. {message}")

            logging.info("Turned power on")

    def ensure_robot_attached(self) -> None:
        message = self.communicator.write_and_read("attach")
        tokens = message.split(" ")
        if tokens[0] != "0":
            raise Exception(f"Got malformed message when requesting attach state. {message}")
        if tokens[1] != "1":
            # Wait 10 seconds for power to come on.
            logging.info("Attaching to robot...")
            message = self.communicator.write_and_read("attach 1")
            if message != "0":
                raise Exception(f"Could not attach to robot. {message}")
            message = self.communicator.write_and_read("attach")
            if message != "0 1":
                raise Exception(f"Could not attach to robot. {message}")

            logging.info("Attached to robot")

    def ensure_robot_homed(self, cur_joint_loc_string: str) -> None:
        message = self.communicator.write_and_read(f"movej 1 {cur_joint_loc_string}")

        # Robot not homed message.
        if message == "-1021":
            logging.info("Homing robot...This may take a moment...")
            message = self.communicator.write_and_read("home", timeout=30)

            if message != "0":
                raise Exception(f"Got malformed message when homing robot. {message}")

            message = self.communicator.write_and_read(f"movej 1 {cur_joint_loc_string}")

            if message != "0":
                raise Exception(f"Could not home robot. {message}")

            logging.info("Robot homed")

    def wait(self, duration: int) -> None:
        time.sleep(duration)
