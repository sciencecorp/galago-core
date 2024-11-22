from dataclasses import dataclass
import logging
import time
from enum import Enum, auto
from typing import Optional, List, Dict, Union, Literal
from abc import ABC
from tools.pf400.tcp_ip import Pf400TcpIp
from tools.base_server import ABCToolDriver

class RobotError(Enum):
    """Error codes for the PF400 robot"""
    NO_ROBOT = -1009
    POWER_DISABLED = -1046
    POWER_TIMEOUT = -1025
    NOT_HOMED = -1021
    JOINT_OUT_OF_RANGE = -1012

class Axis(Enum):
    """Robot movement axes"""
    X = "x"
    Y = "y"
    Z = "z"
    YAW = "yaw"
    PITCH = "pitch"
    ROLL = "roll"

@dataclass
class RobotConfig:
    """Configuration for the PF400 robot"""
    tcp_host: str
    tcp_port: int
    grasp_plate_buffer_mm: int = 10

@dataclass
class Location:
    """Represents a robot location in either joint or Cartesian space"""
    values: List[float]
    
    def to_string(self) -> str:
        """Convert location to space-separated string"""
        return " ".join(str(round(v, 3)) for v in self.values)
    
    @classmethod
    def from_string(cls, loc_string: str) -> 'Location':
        """Create location from space-separated string"""
        values = [float(x) for x in loc_string.split()]
        return cls(values)

class RobotCommunicator:
    """Handles communication with the robot"""
    def __init__(self, tcp_ip: Pf400TcpIp):
        self.tcp_ip = tcp_ip

    def send_command(self, command: str, expected: Optional[str] = None, 
                    timeout: int = 10) -> str:
        """Send command and get response"""
        if expected:
            return self.tcp_ip.write_and_expect(command, expected)
        return self.tcp_ip.write_and_read(command, timeout=timeout)

    def wait_for_completion(self) -> None:
        """Wait for end of movement signal"""
        self.tcp_ip.wait_for_eom()

class RobotState:
    """Manages robot state"""
    def __init__(self):
        self.is_free: bool = False
        self.gripper_axis_override_value: Optional[float] = None

    @property
    def is_plate_gripped(self) -> bool:
        return self.gripper_axis_override_value is not None

class MovementController:
    """Handles robot movement operations"""
    def __init__(self, communicator: RobotCommunicator, state: RobotState):
        self.communicator = communicator
        self.state = state

    def move_joints(self, location: Location, motion_profile: int = 1) -> None:
        """Move robot using joint coordinates"""
        if self.state.is_free:
            self._ensure_not_free()

        loc_values = location.values
        if self.state.gripper_axis_override_value is not None:
            loc_values[4] = self.state.gripper_axis_override_value
        
        loc_string = Location(loc_values).to_string()
        self.communicator.send_command(f"movej {motion_profile} {loc_string}")
        self.communicator.wait_for_completion()

    def move_cartesian(self, location: Location, motion_profile: int = 1) -> None:
        """Move robot using Cartesian coordinates"""
        if self.state.is_free:
            self._ensure_not_free()
            
        self.communicator.send_command(f"movec {motion_profile} {location.to_string()}")
        self.communicator.wait_for_completion()

    def jog(self, axis: Axis, distance: float) -> None:
        """Jog robot along specified axis"""
        current_loc = self._get_current_cartesian_location()
        new_loc = current_loc.values.copy()

        axis_index = {
            Axis.X: 0, Axis.Y: 1, Axis.Z: 2,
            Axis.YAW: 3, Axis.PITCH: 4, Axis.ROLL: 5
        }[axis]
        
        new_loc[axis_index] += distance
        self.move_cartesian(Location(new_loc))

    def _ensure_not_free(self) -> None:
        """Ensure robot is not in free mode"""
        try:
            self._set_free_mode(-1)
            self.state.is_free = False
        except Exception as e:
            logging.error(f"Failed to unfree arm: {e}")
            raise

    def _get_current_cartesian_location(self) -> Location:
        """Get current Cartesian location"""
        response = self.communicator.send_command("wherec")
        return Location([float(x) for x in response.split()[1:-1]])

    def _get_current_joint_location(self) -> Location:
        """Get current joint location"""
        response = self.communicator.send_command("wherej")
        return Location([float(x) for x in response.split()[1:]])

    def _set_free_mode(self, axis: int, timeout: int = 10) -> None:
        """Set free mode for specified axis"""
        self.communicator.send_command(f"freemode {axis}", timeout=timeout)

class GripperController:
    """Handles gripper operations"""
    def __init__(self, communicator: RobotCommunicator, state: RobotState, config: RobotConfig):
        self.communicator = communicator
        self.state = state
        self.config = config

    def grasp_plate(self, plate_width: int, grip_force: int = 10, speed: int = 10) -> None:
        """Grasp a plate"""
        self.state.gripper_axis_override_value = plate_width - self.config.grasp_plate_buffer_mm
        self.communicator.send_command(
            f"graspplate {plate_width} {speed} {grip_force}",
            expected="0 -1"
        )
        self.communicator.wait_for_completion()

    def release_plate(self, plate_width: int, speed: int = 10) -> None:
        """Release a plate"""
        self.state.gripper_axis_override_value = None
        self.communicator.send_command(f"releaseplate {plate_width} {speed}")
        self.communicator.wait_for_completion()

class RobotInitializer:
    """Handles robot initialization"""
    def __init__(self, communicator: RobotCommunicator):
        self.communicator = communicator

    def initialize(self, current_joint_location: Location) -> None:
        """Initialize robot"""
        self._ensure_pc_mode()
        self._ensure_power_on()
        self._ensure_robot_attached()
        self._ensure_robot_homed(current_joint_location)

    def _ensure_pc_mode(self) -> None:
        """Ensure robot is in PC mode"""
        response = self.communicator.send_command("mode")
        messages = response.split('\n')

        if len(messages) > 1 or messages[0] != "0 0":
            logging.info("Switching to PC mode...")
            response = self.communicator.send_command("mode 0")
            if response != "0":
                raise Exception(f"Could not switch to PC mode: {response}")
            
            response = self.communicator.send_command("mode")
            if response != "0 0":
                raise Exception(f"Could not verify PC mode: {response}")
            
            logging.info("Switched to PC mode")

    def _ensure_power_on(self) -> None:
        """Ensure robot power is on"""
        response = self.communicator.send_command("hp")
        if response != "0 1":
            logging.info("Turning on power...")
            response = self.communicator.send_command("hp 1 30")
            if response != "0":
                raise Exception(f"Could not turn power on: {response}")
            
            response = self.communicator.send_command("hp")
            if response != "0 1":
                raise Exception(f"Could not verify power state: {response}")
            
            logging.info("Turned power on")

    def _ensure_robot_attached(self) -> None:
        """Ensure robot is attached"""
        response = self.communicator.send_command("attach")
        if response != "0 1":
            logging.info("Attaching to robot...")
            response = self.communicator.send_command("attach 1")
            if response != "0":
                raise Exception(f"Could not attach to robot: {response}")
            
            response = self.communicator.send_command("attach")
            if response != "0 1":
                raise Exception(f"Could not verify robot attachment: {response}")
            
            logging.info("Attached to robot")

    def _ensure_robot_homed(self, current_joint_location: Location) -> None:
        """Ensure robot is homed"""
        response = self.communicator.send_command(
            f"movej 1 {current_joint_location.to_string()}"
        )

        if response == str(RobotError.NOT_HOMED.value):
            logging.info("Homing robot... This may take a moment...")
            response = self.communicator.send_command("home", timeout=30)
            if response != "0":
                raise Exception(f"Failed to home robot: {response}")

            response = self.communicator.send_command(
                f"movej 1 {current_joint_location.to_string()}"
            )
            if response != "0":
                raise Exception(f"Failed to move to initial position: {response}")

            logging.info("Robot homed")

class Pf400Driver(ABCToolDriver):
    """Main driver class for the PF400 robot"""
    def __init__(self, tcp_host: str, tcp_port: int) -> None:
        self.config = RobotConfig(tcp_host=tcp_host, tcp_port=tcp_port)
        self.tcp_ip = Pf400TcpIp(tcp_host, tcp_port)
        self.state = RobotState()
        
        self.communicator = RobotCommunicator(self.tcp_ip)
        self.movement = MovementController(self.communicator, self.state)
        self.gripper = GripperController(self.communicator, self.state, self.config)
        self.initializer = RobotInitializer(self.communicator)

    def initialize(self) -> None:
        """Initialize the robot"""
        if self.state.is_plate_gripped:
            logging.info(f"Removing gripper value override {self.state.gripper_axis_override_value}")
            self.state.gripper_axis_override_value = None

        current_loc = Location.from_string(self.wherej().split(" ", 1)[1])
        self.initializer.initialize(current_loc)
        self.state.is_free = False

    def close(self) -> None:
        """Close connection to robot"""
        self.tcp_ip.close()

    # Movement commands
    def movej(self, loc_string: str, motion_profile: int = 1) -> None:
        """Move in joint space"""
        self.movement.move_joints(Location.from_string(loc_string), motion_profile)

    def movec(self, loc_string: str, motion_profile: int = 1) -> None:
        """Move in Cartesian space"""
        self.movement.move_cartesian(Location.from_string(loc_string), motion_profile)

    def jog(self, axis: str, distance: float) -> None:
        """Jog along specified axis"""
        try:
            robot_axis = Axis(axis)
            self.movement.jog(robot_axis, distance)
        except ValueError:
            raise Exception(f"Invalid axis {axis}")

    # Free mode commands
    def free(self) -> None:
        """Enable free mode on all axes"""
        logging.info("Freeing robot...")
        self.movement._set_free_mode(0, timeout=15)
        self.state.is_free = True

    def safe_free(self) -> None:
        """Enable free mode on all axes except gripper"""
        logging.info("Freeing robot, safe mode (exclude gripper axis 5)...")
        for axis in [1, 2, 3, 4, 6]:
            self.movement._set_free_mode(axis, timeout=15)
        self.state.is_free = True

    def unfree(self) -> None:
        """Disable free mode"""
        logging.info("Unfreeing robot...")
        self.movement._set_free_mode(-1, timeout=10)
        self.state.is_free = False

    # Gripper commands
    def graspplate(self, plate_width: int, grip_force: int = 10, speed: int = 10) -> None:
        """Grasp a plate"""
        self.gripper.grasp_plate(plate_width, grip_force, speed)

    def releaseplate(self, plate_width: int, speed: int = 10) -> None:
        """Release a plate"""
        self.gripper.release_plate(plate_width, speed)

    def is_plate_gripped(self) -> bool:
        """Check if plate is currently gripped"""
        return self.state.is_plate_gripped

    # Location commands
    def wherej(self) -> str:
        """Get current joint position"""
        return self.communicator.send_command("wherej")

    def wherec(self) -> str:
        """Get current Cartesian position"""
        return self.communicator.send_command("wherec")

    # Utility commands
    def register_motion_profile(self, profile: str) -> None:
        """Register a motion profile"""
        logging.info(f"Registering motion profile {profile}...")
        self.communicator.send_command(f"profile {profile}")

    def wait(self, duration: int) -> None:
        """Wait for specified duration"""
        time.sleep(duration)

    def __del__(self) -> None:
        """Cleanup when driver is destroyed"""
        self.close()