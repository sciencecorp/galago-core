import typing as t
import json
import logging
import os
import networkx as nx
from google.protobuf import message
from google.protobuf.json_format import Parse
from tools.base_server import ToolServer, serve
from tools.grpc_interfaces.pf400_pb2 import Command, Config
from tools.grpc_interfaces.labware_pb2 import Labware
from tools.pf400.waypoints_models import (
    Waypoints,
    Location,
    Nest,
    Coordinate,
    MotionProfile,
)       

from tools.grpc_interfaces.tool_base_pb2 import ExecuteCommandReply
from tools.grpc_interfaces.tool_base_pb2 import SUCCESS, ERROR_FROM_TOOL
from tools.pf400.driver import Pf400Driver
from google.protobuf.struct_pb2 import Struct
import argparse 
from typing import Union, Optional, List
import re
import requests
from requests.exceptions import RequestError

class DatabaseClient:
    def __init__(self, base_url: str = "http://localhost:8000/api"):
        self.base_url = base_url
        
    def create_robot_arm_location(self, location_data: dict) -> dict:
        response = requests.post(f"{self.base_url}/robot-arm-locations", json=location_data)
        response.raise_for_status()
        return response.json()
        
    def create_robot_arm_nest(self, nest_data: dict) -> dict:
        response = requests.post(f"{self.base_url}/robot-arm-nests", json=nest_data)
        response.raise_for_status()
        return response.json()
        
    def get_robot_arm_locations(self, tool_id: int) -> List[dict]:
        response = requests.get(f"{self.base_url}/robot-arm-locations", params={"tool_id": tool_id})
        response.raise_for_status()
        return response.json()
        
    def get_robot_arm_nests(self, tool_id: int) -> List[dict]:
        response = requests.get(f"{self.base_url}/robot-arm-nests", params={"tool_id": tool_id})
        response.raise_for_status()
        return response.json()
        
    def delete_robot_arm_nest(self, nest_id: int) -> dict:
        response = requests.delete(f"{self.base_url}/robot-arm-nests/{nest_id}")
        response.raise_for_status()
        return response.json()

class Pf400Server(ToolServer):
    toolType = "pf400"

    def __init__(self, config_file: str):
        super().__init__(config_file)
        self.db_client = DatabaseClient()
        self.tool_id = None  # Will be set during initialization
        
    def initialize(self) -> None:
        super().initialize()
        # Get tool ID from database based on name/config
        tool_response = requests.get(
            f"{self.db_client.base_url}/tools",
            params={"name": self.config.name}
        )
        tool = tool_response.json()[0]  # Assume unique name
        self.tool_id = tool["id"]
        
        # Load locations and nests from database
        self.load_waypoints()

    def load_waypoints(self) -> None:
        """Load waypoints from database instead of JSON"""
        try:
            locations = self.db_client.get_robot_arm_locations(self.tool_id)
            nests = self.db_client.get_robot_arm_nests(self.tool_id)
            
            # Convert to internal waypoints format
            self.waypoints = {
                "locations": {
                    loc["name"]: Location(
                        loc=Coordinate(f"{loc['j1']} {loc['j2']} {loc['j3']} {loc['j4']} {loc['j5']} {loc['j6']}"),
                        loc_type=loc["location_type"]
                    ) for loc in locations
                },
                "nests": {
                    nest["name"]: Nest(
                        loc=Location(
                            loc=Coordinate(f"{nest['j1']} {nest['j2']} {nest['j3']} {nest['j4']} {nest['j5']} {nest['j6']}"),
                            loc_type=nest["location_type"]
                        ),
                        safe_loc=nest["safe_location_id"],
                        orientation=nest["orientation"]
                    ) for nest in nests
                }
            }
        except Exception as e:
            logging.error(f"Error loading waypoints from database: {str(e)}")
            self.waypoints = {"locations": {}, "nests": {}}

    def CreateLocation(self, params: Command.CreateLocation) -> None:
        """Create location in database instead of JSON"""
        try:
            current_position = re.sub(r'^\S+\s', '', self.driver.wherej())
            
            location_data = {
                "name": params.location_name,
                "location_type": params.loc_type.lower(),
                "coordinate": current_position,
                "tool_id": self.tool_id
            }
            
            created_location = self.db_client.create_robot_arm_location(location_data)
            
            # Update local waypoints
            self.waypoints.locations[params.location_name] = Location(
                loc=Coordinate(current_position),
                loc_type=params.loc_type.lower()
            )
            
        except Exception as e:
            logging.error(f"Error creating location: {str(e)}")

    def save_teachpoint(self, teachpoint: dict) -> None:
        """Save teachpoint to database instead of JSON"""
        try:
            if teachpoint['type'] == 'nest':
                # Parse the coordinate string into individual joint values
                coordinate_values = teachpoint.get('coordinate', '').split()
                nest_data = {
                    "name": teachpoint['name'],
                    "tool_id": self.tool_id,
                    "orientation": teachpoint.get('orientation', 'landscape'),
                    "safe_location_id": teachpoint.get('safe_loc', 'bravo_safe'),
                    "location_type": teachpoint.get('locType', 'j'),
                    "j1": float(coordinate_values[0]) if len(coordinate_values) > 0 else None,
                    "j2": float(coordinate_values[1]) if len(coordinate_values) > 1 else None,
                    "j3": float(coordinate_values[2]) if len(coordinate_values) > 2 else None,
                    "j4": float(coordinate_values[3]) if len(coordinate_values) > 3 else None,
                    "j5": float(coordinate_values[4]) if len(coordinate_values) > 4 else None,
                    "j6": float(coordinate_values[5]) if len(coordinate_values) > 5 else None,
                }
                
                created_nest = self.db_client.create_robot_arm_nest(nest_data)
                
                # Update local waypoints
                self.load_waypoints()  # Reload all waypoints to ensure consistency
                
        except Exception as e:
            logging.error(f"Error saving teachpoint: {str(e)}")

    def moveTo(
        self,
        loc: Location,
        offset: tuple[float, float, float] = (0, 0, 0),
        motion_profile_id: int = 1,
    ) -> None:
        if self.driver is None:
            # Simulation mode
            return
        loc_type = loc.loc_type
        if loc_type == "c":
            string_offset =  f"{offset[0]} {offset[1]} {offset[2]} 0 0 0"
            if self.config.joints == 5:
                string_offset = " ".join(string_offset.split(" ")[:-1])
            self.driver.movec(
                str(loc.loc + Coordinate(string_offset)),
                motion_profile=motion_profile_id,
            )

        elif loc_type == "j":
            string_offset = f"{offset[2]} 0 0 0 0 0"
            #if self.config.joints == 5:
                #string_offset = " ".join(string_offset.split(" ")[:-1])
            self.driver.movej(str(loc.loc + Coordinate(string_offset)), 
                                motion_profile=motion_profile_id)
        else:
            raise Exception("Invalid location type")

    # A path is always cartesian
    def movePath(self, path: list[Location], motion_profile_id: int = 1) -> None:
        for loc in path:
            self.moveTo(loc, motion_profile_id=motion_profile_id)

    def command_instance_from_name(self, command_name: str) -> Union[message.Message, t.Any]:
        command_descriptors = Command.DESCRIPTOR.fields_by_name
        command_dictionary = dict()
        for (field_name, field_descriptor) in command_descriptors.items():
            if field_descriptor.message_type:
                if field_name not in command_dictionary:
                    command_dictionary[field_name] = field_descriptor.message_type.name
        
        return command_dictionary[command_name]
    
    def PickLid(self, params: Command.PickLid) -> None:
        labware:Labware = self.all_labware.get_labware(params.labware)
        if params.location not in self.waypoints.nests:
            raise KeyError("Nest not found: " + params.location)
        grasp: Command.GraspPlate
        tmp_grasp: Union[Command.GraspPlate,Command.ReleasePlate] = self.plate_handling_params[
            self.waypoints.nests[params.location].orientation
        ]["grasp"]
        if isinstance(tmp_grasp, Command.GraspPlate):
            grasp = tmp_grasp
            grasp.force = 15
            grasp.speed = 10
        else:
            raise Exception("Invalid grasp params")

        tmp_adjust_gripper = self.plate_handling_params[self.waypoints.nests[params.location].orientation]["release"]
        if isinstance(tmp_adjust_gripper, Command.ReleasePlate):
            adjust_gripper = tmp_adjust_gripper
        else:
            raise Exception("Invalid release params")

        if params.pick_from_plate:
            lid_height = labware.height - 4 + labware.plate_lid_offset
        else:
            lid_height = labware.plate_lid_offset + labware.lid_offset
            
        self.runSequence(
            [
                adjust_gripper,
                Command.Approach(
                    nest=params.location,
                    z_offset=lid_height,
                    motion_profile_id=params.motion_profile_id,
                    ignore_safepath="false"
                ),
                grasp,
                Command.Approach(
                    nest=params.location,
                    z_offset=lid_height + 8,
                    motion_profile_id=params.motion_profile_id,
                    ignore_safepath="true"
                ),
            ]
        )
    
    def Jog(self, params: Command.Jog) -> None:
        self.driver.jog(params.axis, params.distance)

    def PlaceLid(self, params: Command.PlaceLid) -> None:
        labware:Labware = self.all_labware.get_labware(params.labware)
        if params.location not in self.waypoints.nests:
            raise KeyError("Nest not found: " + params.location)
        
        release: Command.ReleasePlate
        tmp_release: Union[Command.GraspPlate, Command.ReleasePlate] = self.plate_handling_params[
            self.waypoints.nests[params.location].orientation
        ]["release"]
        if isinstance(tmp_release, Command.ReleasePlate):
            release = tmp_release
        else:
            raise Exception("Invalid release params")
        
        if params.place_on_plate:
            lid_height = labware.height - 4 + labware.plate_lid_offset
        else:
            lid_height = labware.plate_lid_offset + labware.lid_offset

        self.runSequence(
            [
                Command.Approach(
                    nest=params.location,
                    z_offset=lid_height,
                    motion_profile_id=params.motion_profile_id,
                    ignore_safepath="true"
                ),
                release,
                Command.Approach(
                    nest=params.location,
                    z_offset=lid_height + 8,
                    motion_profile_id=params.motion_profile_id,
                    ignore_safepath="true"
                ),
            ]
        )


    def RetrievePlate(self, params: Command.RetrievePlate) -> None:
        labware:Labware = params.labware
        offset = (0,0,labware.z_offset)
        self.retrieve_plate(source_nest=params.location, motion_profile_id=params.motion_profile_id, nest_offset=offset)

    def DropOffPlate(self, params: Command.DropOffPlate) -> None:
        labware: Labware = params.labware
        offset = (0,0,labware.z_offset) #we only care about the z offset based on the labware
        self.dropoff_plate(destination_nest=params.location, motion_profile_id=params.motion_profile_id, nest_offset=offset)

    def CreateNest(self, params: Command.CreateNest) -> None:
        current_position = re.sub(r'^\S+\s', '', self.driver.wherej())
        
        # Read the entire JSON file
        waypoints_json_file = os.path.join(os.path.dirname(__file__), "config", self.waypoints_json_file)
        with open(waypoints_json_file, 'r') as f:
            waypoints_data = json.load(f)
        
        # Update or create the specific nest
        if params.nest_name not in waypoints_data['nests']:
            waypoints_data['nests'][params.nest_name] = {
                'loc': {
                    'j1': float(current_position.split(" ")[0]),
                    'j2': float(current_position.split(" ")[1]),
                    'j3': float(current_position.split(" ")[2]),
                    'j4': float(current_position.split(" ")[3]),
                    'j5': float(current_position.split(" ")[4]),
                    'j6': float(current_position.split(" ")[5]),
                    'loc_type': params.loc_type
                },
                'orientation': params.orientation,
                'safe_loc': params.safe_loc
            }
        
        # Write the updated data back to the file
        with open(waypoints_json_file, 'w') as f:
            json.dump(waypoints_data, f, indent=2)
        
        # Update the in-memory waypoints object
        if params.nest_name not in self.waypoints.nests:
            self.waypoints.nests[params.nest_name] = Nest(
                loc=Location(
                    loc=Coordinate(current_position),
                    loc_type='j'
                ),
                orientation='portrait' if params.orientation.lower() == 'portrait' else 'landscape',
                safe_loc=params.safe_loc
            )
        

    def DeleteNest(self, params: Command.DeleteNest) -> None:
        try:
            # Find nest by name
            response = requests.get(
                f"{self.db_client.base_url}/robot-arm-nests",
                params={"tool_id": self.tool_id}
            )
            nests = response.json()
            nest = next((n for n in nests if n["name"] == params.nest_name), None)
            
            if nest:
                # Delete the nest from database
                response = requests.delete(
                    f"{self.db_client.base_url}/robot-arm-nests/{nest['id']}"
                )
                response.raise_for_status()
                self.load_waypoints()  # Reload waypoints
        except Exception as e:
            logging.error(f"Error deleting nest: {str(e)}")
            raise

    def DeleteLocation(self, params: Command.DeleteLocation) -> None:
        try:
            # Find location by name
            response = requests.get(
                f"{self.db_client.base_url}/robot-arm-locations",
                params={"tool_id": self.tool_id}
            )
            locations = response.json()
            location = next((l for l in locations if l["name"] == params.location_name), None)
            
            if location:
                # Delete the location from database
                response = requests.delete(
                    f"{self.db_client.base_url}/robot-arm-locations/{location['id']}"
                )
                response.raise_for_status()
                self.load_waypoints()  # Reload waypoints
        except Exception as e:
            logging.error(f"Error deleting location: {str(e)}")
            raise
    
    def GetTeachpoints(self, params: Command.GetTeachpoints) -> ExecuteCommandReply:
        response = ExecuteCommandReply()
        response.return_reply = True
        response.response = SUCCESS
        try:
            waypoints_json_file = os.path.join(os.path.dirname(__file__), "config", self.waypoints_json_file)
            with open(waypoints_json_file, 'r') as f:
                waypoints_data = json.load(f)
            s = Struct()
            s.update(waypoints_data)
            response.meta_data.CopyFrom(s)
            return response
        except Exception as e:
            logging.error("Error getting teachpoints: %s", str(e))
            response.response = ERROR_FROM_TOOL
            return response
    
    def GetCurrentLocation(self, params: Command.GetCurrentLocation) -> ExecuteCommandReply:
        response = ExecuteCommandReply()
        response.return_reply = True
        response.response = SUCCESS
        try:
            location: str = self.driver.wherej()
            if location.split(" ")[0] != "0":
                raise RuntimeError("Failed to get location coordinates")
            else:
                # Extract the actual coordinates (assuming they start from the second element)
                coordinates = " ".join(location.split(" "))
                
                # Create a Struct to hold the location data
                s = Struct()
                s.update({"location": coordinates})
                
                # Set the meta_data field of the response
                response.meta_data.CopyFrom(s)
                
                return response
        except Exception as exc:
            logging.exception(exc)
            response.response = ERROR_FROM_TOOL
        return response

    def RunSequence(self, params: Command.RunSequence) -> None:
        
        sequence_file : str = os.path.join(self.sequence_location, f"{params.sequence_name}.json")        
        if not os.path.exists(sequence_file):
            raise FileNotFoundError(f"Sequence {sequence_file} does not exist!")
       
        commandSequence : list[message.Message] = list()
        
        #Load the sequence 
        with open(sequence_file) as f:
            sequences_json = json.load(f)
            for arm_command in sequences_json:
                command_params :t.Any = arm_command['params']
                command_name :str = arm_command['command']
                command_type : t.Any = self.command_instance_from_name(command_name)
                command : t.Any  = getattr(Command, command_type)

                if command_name == 'dropoff_plate' or command_name == 'retrieve_plate'  or command_name == 'pick_lid' or command_name == 'place_lid':
                    if params.labware is not None:
                        command_params["labware"] = params.labware

                command_parsed = Parse(json.dumps(command_params), command())

                commandSequence.append(command_parsed)

        #At the end run the sequence through tools
        self.runSequence(commandSequence)
        
    def GraspPlate(self, params: Command.GraspPlate) -> None:
        self.driver.graspplate(params.width, params.force, params.speed)

    def ReleasePlate(self, params: Command.ReleasePlate) -> None:
        self.driver.releaseplate(params.width, params.speed)

    def Free(self,params: Command.Free) -> None:
        self.driver.safe_free()

    def UnFree(self,params: Command.UnFree) -> None:
        self.driver.unfree()

    def Unwind(self,params: Command.Unwind) -> None:
        waypoint_name = "unwind"
        if waypoint_name not in self.waypoints.locations:
            raise KeyError("Unwind location not found")
        waypoint_loc = self.waypoints.locations[waypoint_name].loc
        current_loc_array = self.driver.wherej().split(" ")
        #Unwind the arm while keeping the z height, gripper width and rail constant
        #current_loc_array[1] is the z height, current_loc_array[6] is the gripper (regardless of the number of joints)
        if self.config.joints == 5:
           new_loc = f"{current_loc_array[1]} {waypoint_loc.vec[1]} {waypoint_loc.vec[2]} {waypoint_loc.vec[3]} {current_loc_array[5]}"
        else:
            new_loc = f"{current_loc_array[1]} {waypoint_loc.vec[1]} {waypoint_loc.vec[2]} {waypoint_loc.vec[3]} {current_loc_array[5]} {current_loc_array[6]}"
        self.driver.movej(new_loc,  motion_profile=2)

    def Move(self, params: Command.Move) -> None:
        waypoint_name = params.waypoint
        if waypoint_name not in self.waypoints.locations:
            raise KeyError("Waypoint not found: " + waypoint_name)
        waypoint_loc = self.waypoints.locations[waypoint_name]
        self.moveTo(waypoint_loc, motion_profile_id=params.motion_profile_id)

    def Approach(self, params: Command.Approach) -> None:
        nest_name = params.nest
        if nest_name not in self.waypoints.nests:
            raise KeyError("Nest not found: " + nest_name)
        if not params.motion_profile_id:
            params.motion_profile_id = 1
        nest_def = self.waypoints.nests[nest_name]

        # Move directly to nest location with offset
        offset = (0, 0, params.z_offset) if params.z_offset else (0, 0, 0)
        self.moveTo(nest_def.loc, offset=offset, motion_profile_id=params.motion_profile_id)

    def Leave(self, params: Command.Leave) -> None:
        nest_name = params.nest
        if nest_name not in self.waypoints.nests:
            raise KeyError("Nest not found: " + nest_name)
        if not params.motion_profile_id:
            params.motion_profile_id = 1
        nest_def = self.waypoints.nests[nest_name]
        self.movePath(
            self.nestPath(
                nest_def,
                offset=(
                    params.x_offset,
                    params.y_offset,
                    params.z_offset,
                ),
            ),
            motion_profile_id=params.motion_profile_id,
        )

    def Transfer(self, params: Command.Transfer) -> None:
        if params.source_nest.nest not in self.waypoints.nests:
            raise KeyError("Nest not found: " + params.source_nest.nest)
        if params.destination_nest.nest not in self.waypoints.nests:
            raise KeyError("Nest not found: " + params.destination_nest.nest)
        if (
            self.waypoints.nests[params.source_nest.nest].orientation
            != self.waypoints.nests[params.destination_nest.nest].orientation
        ):
            raise Exception("Source and destination nests must have the same orientation")
        if not params.motion_profile_id:
            params.motion_profile_id = 1
        if params.source_nest.nest.startswith("hotel") or params.source_nest.nest.startswith(
            "biolab_hotel"
        ):
            self.runSequence(
                [
                    Command.Move(
                        waypoint="middle_safe",
                        motion_profile_id=params.motion_profile_id,
                    )
                ]
            )
        self.retrieve_plate(
            source_nest=params.source_nest.nest,
            grasp_params=params.grasp_params,
            nest_offset=(
                params.source_nest.x_offset,
                params.source_nest.y_offset,
                params.source_nest.z_offset,
            ),
            motion_profile_id=params.motion_profile_id,
            grip_width=params.grip_width,
        )
        if (
            params.source_nest.nest.startswith("hotel")
            or params.destination_nest.nest.startswith("hotel")
            or params.source_nest.nest.startswith("biolab_hotel")
            or params.destination_nest.nest.startswith("biolab_hotel")
        ):
            self.runSequence(
                [
                    Command.Move(
                        waypoint="middle_safe",
                        motion_profile_id=params.motion_profile_id,
                    )
                ]
            )
        self.dropoff_plate(
            destination_nest=params.destination_nest.nest,
            release_params=params.release_params,
            nest_offset=(
                params.destination_nest.x_offset,
                params.destination_nest.y_offset,
                params.destination_nest.z_offset,
            ),
            motion_profile_id=params.motion_profile_id,
            grip_width=params.grip_width,
        )
        if params.destination_nest.nest.startswith(
            "hotel"
        ) or params.destination_nest.nest.startswith("biolab_hotel"):
            self.runSequence(
                [
                    Command.Move(
                        waypoint="middle_safe",
                        motion_profile_id=params.motion_profile_id,
                    )
                ]
            )

    def retrieve_plate(
        self,
        source_nest: str,
        grasp_params: Optional[Command.GraspPlate] = None,
        nest_offset: tuple[float, float, float] = (0, 0, 0),
        motion_profile_id: int = 1,
        grip_width: int = 0,
    ) -> None:
        if source_nest not in self.waypoints.nests:
            raise KeyError("Nest not found: " + source_nest)
        safe_point: str = self.waypoints.nests[source_nest].safe_loc
        grasp: Command.GraspPlate
        if not grasp_params or (grasp_params.width == 0):
            tmp_grasp: Union[Command.GraspPlate,Command.ReleasePlate] = self.plate_handling_params[
                self.waypoints.nests[source_nest].orientation
            ]["grasp"]
            if isinstance(tmp_grasp, Command.GraspPlate):
                grasp = tmp_grasp
            else:
                raise Exception("Invalid grasp params")
        else:
            grasp = grasp_params
        if grip_width > 0:
            adjust_gripper = Command.ReleasePlate(width=grip_width, speed=10)
        else:
            tmp_adjust_gripper = self.plate_handling_params[
                self.waypoints.nests[source_nest].orientation
            ]["release"]
            if isinstance(tmp_adjust_gripper, Command.ReleasePlate):
                adjust_gripper = tmp_adjust_gripper
            else:
                raise Exception("Invalid release params")
        self.runSequence(
            [
                Command.Move(waypoint=safe_point, motion_profile_id=1),
                adjust_gripper,
                Command.Approach(
                    nest=source_nest,
                    x_offset=nest_offset[0],
                    y_offset=nest_offset[1],
                    z_offset=nest_offset[2],
                    motion_profile_id=motion_profile_id,
                ),
                grasp,
                Command.Leave(
                    nest=source_nest,
                    x_offset=nest_offset[0],
                    y_offset=nest_offset[1],
                    z_offset=nest_offset[2],
                    motion_profile_id=motion_profile_id,
                ),
                Command.Move(waypoint=safe_point, motion_profile_id=2),
            ]
        )

    def dropoff_plate(
        self,
        destination_nest: str,
        release_params: Optional[Command.ReleasePlate] = None,
        nest_offset: tuple[float, float, float] = (0, 0, 0),
        motion_profile_id: int = 1,
        grip_width: int = 0,
    ) -> None:
        if destination_nest not in self.waypoints.nests:
            raise KeyError("Nest not found: " + destination_nest)
        safe_point: str = self.waypoints.nests[destination_nest].safe_loc
        release: Command.ReleasePlate
        if not release_params or (release_params.width == 0):
            tmp_release: Union[Command.GraspPlate , Command.ReleasePlate] = self.plate_handling_params[
                self.waypoints.nests[destination_nest].orientation
            ]["release"]
            if isinstance(tmp_release, Command.ReleasePlate):
                release = tmp_release
            else:
                raise Exception("Invalid release params")
        else:
            release = release_params
        self.runSequence(
            [
                Command.Move(waypoint=safe_point, motion_profile_id=1),
                Command.Approach(
                    nest=destination_nest,
                    x_offset=nest_offset[0],
                    y_offset=nest_offset[1],
                    z_offset=nest_offset[2],
                    motion_profile_id=motion_profile_id,
                ),
                release,
                Command.Leave(
                    nest=destination_nest,
                    x_offset=nest_offset[0],
                    y_offset=nest_offset[1],
                    z_offset=nest_offset[2],
                    motion_profile_id=motion_profile_id,
                ),
                Command.Move(waypoint=safe_point, motion_profile_id=1),
            ]
        )

    def RegisterMotionProfile(self, params: Command.RegisterMotionProfile) -> None:
        motion_profile = MotionProfile(
            id=params.id,
            speed=params.speed,
            speed2=params.speed2,
            acceleration=params.accel,
            deceleration=params.decel,
            accelramp=params.accel_ramp,
            decelramp=params.decel_ramp,
            inrange=params.inrange,
            straight=params.straight,
        )
        self.driver.register_motion_profile(str(motion_profile))

    def calculate_path(
        self, source_waypoint_name: str, destination_waypoint_name: str
    ) -> list[str]:
        return nx.shortest_path(  # type: ignore
            G=self.graph, source=source_waypoint_name, target=destination_waypoint_name
        )

    def find_nearest_safe_point(self) -> str:
        current_position = Coordinate(self.driver.get_cur_joint_loc_string())
        nearest_safe_point: str = ""
        nearest_safe_point_distance: float = float("inf")
        for safe_point_name, safe_point in self.waypoints.locations.items():
            safe_point_position = safe_point.loc
            distance = current_position.distance_to(safe_point_position)
            if distance < nearest_safe_point_distance:
                nearest_safe_point = safe_point_name
                nearest_safe_point_distance = distance
        return nearest_safe_point

    def SaveTeachpoints(self, params: Command.SaveTeachpoints) -> None:
        try:
            for teachpoint in params.teachpoints:
                self.save_teachpoint({
                    "name": teachpoint.name,
                    "coordinate": teachpoint.coordinate,
                    "type": teachpoint.type,
                    "locType": teachpoint.loc_type,
                    "isEdited": teachpoint.is_edited
                })
        except Exception as e:
            logging.error(f"Error saving teachpoints: {str(e)}")
            raise  

    def Wait(self, params: Command.Wait) -> None:
        self.driver.wait(duration=params.duration)

    def EstimateGraspPlate(self, params: Command.GraspPlate) -> int:
        return 1
    
    def EstimateCreateNest(self, params: Command.CreateNest) -> int:
        return 1

    def EstimateDeleteNest(self, params: Command.DeleteNest) -> int:
        return 1
    
    def EstimateDeleteLocation(self, params: Command.DeleteLocation) -> int:
        return 1
    
    def EstimateCreateLocation(self, params: Command.CreateLocation) -> int:
        return 1

    def EstimateReleasePlate(self, params: Command.ReleasePlate) -> int:
        return 1

    def EstimateMove(self, params: Command.Move) -> int:
        # return 5
        return 1

    def EstimateApproach(self, params: Command.Approach) -> int:
        # return 2
        return 1

    def EstimateLeave(self, params: Command.Leave) -> int:
        # return 2
        return 1

    def EstimateTransfer(self, params: Command.Transfer) -> int:
        # return 16
        return 1

    def EstimateRegisterMotionProfile(self, params: Command.RegisterMotionProfile) -> int:
        return 1

    def EstimateSmartTransfer(self, params: Command.SmartTransfer) -> int:
        return 1

    def EstimateWait(self, params: Command.Wait) -> int:
        return 1
    
    def EstimateUnwind(self, params: Command.Unwind) -> int:
        return 1
    
    def EstimateRunSequence(self, params: Command.RunSequence) -> int:
        return 1
    def EstimateRetrievePlate(self, params: Command.RetrievePlate) -> int:
        return 1
    def EstimateDropOffPlate(self, params: Command.DropOffPlate) -> int:    
        return 1
    def EstimateGetTeachpoints(self, params: Command.GetTeachpoints) -> int:
        return 1
    def EstimateSaveTeachpoints(self, params: Command.SaveTeachpoints) -> int:
        return 1

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    parser = argparse.ArgumentParser()
    parser.add_argument('--port')
    args = parser.parse_args()
    if not args.port:
         raise RuntimeWarning("Port must be provided...")
    serve(Pf400Server(), str(args.port))