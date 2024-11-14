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
from tools.grpc_interfaces.tool_base_pb2 import INVALID_ARGUMENTS, SUCCESS, ERROR_FROM_TOOL
from tools.pf400.driver import Pf400Driver
from google.protobuf.struct_pb2 import Struct
import argparse 
from typing import Union, Optional
import re

class Pf400Server(ToolServer):
    toolType = "pf400"

    def __init__(self) -> None:
        super().__init__()
        self.driver: Pf400Driver
        self.waypoints: Waypoints
        self.waypoints_json_file: str
        self.graph: nx.Graph
        self.sequence_location : str
        self.teachpoints : t.Any
        self.plate_handling_params : dict[str, dict[str, Union[Command.GraspPlate, Command.ReleasePlate]]] = {}

    def _configure(self, request: Config) -> None:
        self.config = request
        self.waypoints_json_file = self.config.waypoints_json_file
        self.sequence_location = os.path.join(os.path.dirname(__file__), "sequences", self.waypoints_json_file.split(".")[0])
        waypoints_file_path = os.path.join(os.path.dirname(__file__), "config", self.waypoints_json_file)
        if not os.path.exists(waypoints_file_path):
            logging.warning(f"Waypoints file not found. Creating default file: {waypoints_file_path}")
            self.create_default_waypoints_file(waypoints_file_path)
        with open(waypoints_file_path) as f:
            config = json.load(f)
            self.teachpoints = config
            self.waypoints = Waypoints.parse_obj(config)
            self.graph = nx.Graph()
            for edge in self.waypoints.graph_edges:
                self.graph.add_edge(*edge)  # type: ignore
        if self.driver:
           self.driver.close()
        self.driver = Pf400Driver(tcp_host=self.config.host, tcp_port=self.config.port)
        self.driver.initialize()
        for motion_profile in self.waypoints.motion_profiles:
            self.driver.register_motion_profile(str(motion_profile))
        if "landscape" not in self.waypoints.grip_params or "portrait" not in self.waypoints.grip_params:
            raise KeyError("missing lanndscape or portrait grip settings")
        for grip in self.waypoints.grip_params:
            plate_width : int = self.waypoints.grip_params[grip].width
            grip_force : int = self.waypoints.grip_params[grip].force
            grip_speed : int = self.waypoints.grip_params[grip].speed
            self.plate_handling_params[grip] = {
                "grasp": Command.GraspPlate(width=plate_width, force=grip_force, speed=grip_speed),
                "release": Command.ReleasePlate(width=plate_width+10, speed=10),
            }

    def create_default_waypoints_file(self, file_path: str) -> None:
        default_waypoints = {
            "grip_params": {
                "landscape": {"width": 122, "speed": 10, "force": 15},
                "portrait": {"width": 86, "speed": 10, "force": 15}
            },
            "graph_edges": [],
            "locations": {},
            "nests": {},
            "motion_profiles": [
                {
                    "id": 2,
                    "speed": 60,
                    "speed2": 0,
                    "acceleration": 60,
                    "deceleration": 60,
                    "accelramp": 0.1,
                    "decelramp": 0.1,
                    "inrange": 0,
                    "straight": 0
                },
                {
                    "id": 3,
                    "speed": 80,
                    "speed2": 0,
                    "acceleration": 80,
                    "deceleration": 80,
                    "accelramp": 0.1,
                    "decelramp": 0.1,
                    "inrange": 0,
                    "straight": 0
                }
            ]
        }

        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w') as f:
            json.dump(default_waypoints, f, indent=2)

        logging.info(f"Created default waypoints file: {file_path}")

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

    def nestPath(
        self, nest: Nest, offset: tuple[float, float, float] = (0, 0, 0)
    ) -> list[Location]:
        if(nest.loc.loc_type == "c"):
            offset_coordinate = f"{offset[0]} {offset[1]} {offset[2]} 0 0 0"
        if(nest.loc.loc_type == "j"):
            offset_coordinate = f"{offset[2]} 0 0 0 0 0"
        # nest_loc = re.sub(r'^\S+\s', '', nest.loc.loc)
        nest_loc = nest.loc.loc
        if self.config.joints == 5:
            offset_coordinate = " ".join(offset_coordinate.split(" ")[:-1])
        return [
            Location(
                loc=Coordinate(nest_loc) + Coordinate(checkpoint) + Coordinate(offset_coordinate),
                loc_type=nest.loc.loc_type,
            )
            for checkpoint in nest.approach_path
        ]

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
                'approach_path': [],
                'loc': {
                    'loc': current_position,
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
                approach_path=[],
                loc=Location(
                    loc=Coordinate(current_position),
                    loc_type='j'
                ),
                orientation='portrait' if params.orientation.lower() == 'portrait' else 'landscape',
                safe_loc=params.safe_loc
            )
        

    def CreateLocation(self, params: Command.CreateLocation) -> None:
        try:
            current_position = re.sub(r'^\S+\s', '', self.driver.wherej())

            waypoints_json_file = os.path.join(os.path.dirname(__file__), "config", self.waypoints_json_file)
            with open(waypoints_json_file, 'r') as f:
                waypoints_data = json.load(f)

            waypoints_data['locations'][params.location_name] = {
                'loc': current_position,
                'loc_type': 'j'
            }

            with open(waypoints_json_file, 'w') as f:
                json.dump(waypoints_data, f, indent=2)

            if params.location_name not in self.waypoints.locations:
                self.waypoints.locations[params.location_name] = Location(
                    loc=Coordinate(current_position),
                    loc_type='j' if params.loc_type.lower() == 'j' else 'c'
                )
        except Exception as e:
            logging.error("Error creating location: %s", str(e))
    
    def DeleteNest(self, params: Command.DeleteNest) -> None:
        waypoints_json_file = os.path.join(os.path.dirname(__file__), "config", self.waypoints_json_file)
        with open(waypoints_json_file, 'r') as f:
            waypoints_data = json.load(f)
        if params.nest_name in waypoints_data['nests']:
            del waypoints_data['nests'][params.nest_name]
            with open(waypoints_json_file, 'w') as f:
                json.dump(waypoints_data, f, indent=2)

    def DeleteLocation(self, params: Command.DeleteLocation) -> None:
        waypoints_json_file = os.path.join(os.path.dirname(__file__), "config", self.waypoints_json_file)
        with open(waypoints_json_file, 'r') as f:
            waypoints_data = json.load(f)
        if params.location_name in waypoints_data['locations']:
            del waypoints_data['locations'][params.location_name]
            with open(waypoints_json_file, 'w') as f:
                json.dump(waypoints_data, f, indent=2)
    

    def AddToPath(self, params: Command.AddToPath) -> None:
        current_position = re.sub(r'^\S+\s', '', self.driver.wherej())
        logging.info("Current position: " + current_position)
        if params.nest_name not in self.waypoints.nests:
            raise KeyError("Nest not found: " + params.nest_name)
        
        # Read the entire JSON file
        waypoints_json_file = os.path.join(os.path.dirname(__file__), "config", self.waypoints_json_file)
        with open(waypoints_json_file, 'r') as f:
            waypoints_data = json.load(f)
        
        # Get the nest location
        nest_location = Coordinate(waypoints_data['nests'][params.nest_name]['loc']['loc'])
        
        # Calculate the difference
        current_coord = [float(x) for x in current_position.split()]
        logging.info("Current position X: " + str(current_coord))
        nest_coord = [float(x) for x in nest_location.split()]
        logging.info("Nest position: " + str(nest_coord))
        
        # Ensure both coordinates are valid before subtraction
        if len(current_coord) == len(nest_coord) and all(isinstance(x, float) for x in current_coord + nest_coord):
            diff_coord = [round(a - b, 3) for a, b in zip(current_coord, nest_coord)]
            diff_coord_str = f"{' '.join(f'{x:.3f}' for x in diff_coord)}"  # Convert diff_coord to a string representation of a list with 3 decimal places
        else:
            logging.error(f"Invalid coordinates: current_coord={current_coord}, nest_location={nest_location}")
            raise ValueError("Invalid coordinates: Unable to calculate difference")        
        # Update only the specific nest

        logging.info("Diff coordinate: " + diff_coord_str)
        if params.nest_name in waypoints_data['nests']:
            if 'approach_path' not in waypoints_data['nests'][params.nest_name]:
                waypoints_data['nests'][params.nest_name]['approach_path'] = []
            
            # Append the difference to the approach path
            waypoints_data['nests'][params.nest_name]['approach_path'].append(diff_coord_str)
        
        # Write the updated data back to the file
        with open(waypoints_json_file, 'w') as f:
            json.dump(waypoints_data, f, indent=2)
        
        # Update the in-memory waypoints object
        self.waypoints.nests[params.nest_name].approach_path.append(Coordinate(diff_coord_str))

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

        ignore_path = False
        if params.ignore_safepath == "true" or params.ignore_safepath == "True":
            ignore_path = True
        if ignore_path is not True:
            self.movePath(
                self.nestPath(
                    nest_def,
                    offset=(
                        params.x_offset,
                        params.y_offset,
                        params.z_offset,
                    ),
                )[::-1],
                motion_profile_id=params.motion_profile_id,
            )

        self.moveTo(
            nest_def.loc,
            offset=(
                params.x_offset,
                params.y_offset,
                params.z_offset,
            ),
            motion_profile_id=params.motion_profile_id,
        )

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
                    "approachPath": list(teachpoint.approach_path), 
                    "isEdited": teachpoint.is_edited
                })
        except Exception as e:
            logging.error(f"Error saving teachpoints: {str(e)}")
            raise  

    def save_teachpoint(self, teachpoint: dict) -> None:
        waypoints_file = os.path.join(os.path.dirname(__file__), "config", self.waypoints_json_file)
        try:
            # Read the current waypoints
            with open(waypoints_file, 'r') as f:
                waypoints = json.load(f)

            # Update the waypoints
            if teachpoint['type'] == 'nest':
                if teachpoint['name'] not in waypoints['nests']:
                    waypoints['nests'][teachpoint['name']] = {}
                
                nest = waypoints['nests'][teachpoint['name']]
                
                # Update only the changed fields
                if 'approachPath' in teachpoint:
                    nest['approach_path'] = teachpoint['approachPath']
                
                if 'coordinate' in teachpoint or 'locType' in teachpoint:
                    if 'loc' not in nest:
                        nest['loc'] = {}
                    if 'coordinate' in teachpoint:
                        nest['loc']['loc'] = teachpoint['coordinate']
                    if 'locType' in teachpoint:
                        nest['loc']['loc_type'] = teachpoint['locType']
                
                # Only set these if they're not already present
                if 'orientation' not in nest:
                    nest['orientation'] = "landscape"
                if 'safe_loc' not in nest:
                    nest['safe_loc'] = "bravo_safe"

            else:  # location
                if teachpoint['name'] not in waypoints['locations']:
                    waypoints['locations'][teachpoint['name']] = {}
                
                location = waypoints['locations'][teachpoint['name']]
                
                # Update only the changed fields
                if 'coordinate' in teachpoint:
                    location['loc'] = teachpoint['coordinate']
                if 'locType' in teachpoint:
                    location['loc_type'] = teachpoint['locType']

            # Write the updated waypoints back to the file
            with open(waypoints_file, 'w') as f:
                json.dump(waypoints, f, indent=2)
        except Exception as e:
            logging.error(f"Error saving teachpoint {teachpoint['name']}: {str(e)}")
            raise  # Re-raise the exception to be caught by the error handler

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