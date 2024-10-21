import typing as t
import json
import logging
import os
import networkx as nx
from google.protobuf import message
from google.protobuf.json_format import Parse
from tools.base_server import ToolServer, serve
from tools.labware import LabwareDb, Labware
from tools.grpc_interfaces.pf400_pb2 import Command, Config
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

class Pf400Server(ToolServer):
    toolType = "pf400"

    def __init__(self) -> None:
        super().__init__()
        self.driver: Pf400Driver
        self.waypoints: Waypoints
        self.graph: nx.Graph
        self.sequence_location : str
        self.teachpoints : t.Any
        self.plate_handling_params : dict[str, dict[str, Union[Command.GraspPlate, Command.ReleasePlate]]] = {}

    def _configure(self, request: Config) -> None:
        self.config = request
        if self.config.location == Config.ULTRALIGHT_WORKCELL:
            waypoints_json_file = "ultralight_waypoints.json"
            self.sequence_location = os.path.join(os.path.dirname(__file__), "sequences", "ultralight")
        elif self.config.location == Config.BIOLAB_WORKCELL:
            waypoints_json_file = "biolab_waypoints.json"
            self.sequence_location = os.path.join(os.path.dirname(__file__), "sequences", "biolab")
        elif self.config.location == Config.BAYMAX_WORKCELL:
            waypoints_json_file = "baymax_waypoints.json"
            self.sequence_location = os.path.join(os.path.dirname(__file__), "sequences", "baymax")
        else:
            raise ValueError(f"Invalid location: {self.config.location}")
        logging.debug(f"Loading pf400 waypoints from {waypoints_json_file}")


        with open(os.path.join(os.path.dirname(__file__), "config", waypoints_json_file)) as f:
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

        self.all_labware : LabwareDb = LabwareDb()

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
        # Given a nest, return a path to the nest in cartesian space
        if(nest.loc.loc_type == "c"):
            offset_coordinate = f"{offset[0]} {offset[1]} {offset[2]} 0 0 0"
        if(nest.loc.loc_type == "j"):
            offset_coordinate = f"{offset[2]} 0 0 0 0 0"
        nest_loc = nest.loc.loc
        logging.info("Nest location is "+ str(nest_loc))
        logging.info("Offset is "+ str(offset_coordinate))
        if self.config.joints == 5:
            offset_coordinate = " ".join(offset_coordinate.split(" ")[:-1])
        logging.info("Joint is "+ str(self.config.joints))
        logging.info("Offset is "+ str(offset_coordinate))   
        return [
            Location(
                loc=nest_loc + checkpoint + offset_coordinate,
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
        
        logging.info("Place lid params are "+ str(params.place_on_plate))
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
        labware:Labware = self.all_labware.get_labware(params.labware)
        offset = (0,0,labware.zoffset)
        self.retrieve_plate(source_nest=params.location, motion_profile_id=params.motion_profile_id, nest_offset=offset)

    def DropOffPlate(self, params: Command.DropOffPlate) -> None:
        labware:Labware = self.all_labware.get_labware(params.labware)
        offset = (0,0,labware.zoffset)
        self.dropoff_plate(destination_nest=params.location, motion_profile_id=params.motion_profile_id, nest_offset=offset)

    def GetTeachpoints(self, params: Command.GetTeachpoints) -> ExecuteCommandReply:
        s = Struct()
        response = ExecuteCommandReply()
        response.return_reply = True
        response.response = SUCCESS
        try:
            s.update(self.teachpoints)
            response.meta_data.CopyFrom(s)
        except Exception as exc:
            logging.exception(exc)
            response.response = ERROR_FROM_TOOL

        return response

    def GetCurrentLocation(self, params: Command.GetCurrentLocation) -> ExecuteCommandReply:
        #s : Struct= Struct()
        response = ExecuteCommandReply()
        response.return_reply = True
        response.response = SUCCESS
        try:
            location:str= self.driver.wherej()
            if location.split(" ")[0] != "0":
                raise RuntimeError("Failed to get location coordinates")
            else:
                #coordinate : Coordinate = Location.parse_obj(location)
                #logging.info(f"Current coordinate is {coordinate}")
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
        logging.info("Moving to waypoint %s at %s", waypoint_name, waypoint_loc)
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
            logging.info("Going through safe path")
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
        logging.info("Leaving nest %s at %s", nest_name, nest_def.loc)
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

    def SmartTransfer(self, params: Command.SmartTransfer) -> ExecuteCommandReply:
        response = ExecuteCommandReply()
        response.return_reply = True
        response.response = SUCCESS
        try:    
            if params.source_nest.nest not in self.waypoints.nests:
                raise KeyError("Nest not found: " + params.source_nest.nest)
            if params.destination_nest.nest not in self.waypoints.nests:
                raise KeyError("Nest not found: " + params.destination_nest.nest)
            if not params.motion_profile_id:
                params.motion_profile_id = 1
            source_nest: Nest = self.waypoints.nests[params.source_nest.nest]
            destination_nest: Nest = self.waypoints.nests[params.destination_nest.nest]
            nearest_safe_loc_name: str
            current_to_source_path: list[str]
            current_to_source_commands: list[message.Message]
            source_to_destination_path: list[str]
            source_to_destination_commands: list[message.Message]
            if "fridge_hotel" in params.source_nest.nest:
                nearest_safe_loc_name = self.find_nearest_safe_point()
                current_to_source_path = self.calculate_path(
                    source_waypoint_name=nearest_safe_loc_name,
                    destination_waypoint_name="rp_hotel_safe_nest",
                )
                current_to_source_commands = self.convert_path_to_commands(
                    path=current_to_source_path, params=params, skip_nests=True
                )
                self.runSequence(current_to_source_commands)
            nearest_safe_loc_name = self.find_nearest_safe_point()
            current_to_source_path = self.calculate_path(
                source_waypoint_name=nearest_safe_loc_name,
                destination_waypoint_name=source_nest.safe_loc,
            )
            current_to_source_commands = self.convert_path_to_commands(
                path=current_to_source_path, params=params, skip_nests=True
            )

            self.runSequence(current_to_source_commands)
            nearest_safe_loc_name = self.find_nearest_safe_point()
            current_to_source_path = self.calculate_path(
                source_waypoint_name=nearest_safe_loc_name,
                destination_waypoint_name=source_nest.safe_loc,
            )
            current_to_source_commands = self.convert_path_to_commands(
                path=current_to_source_path, params=params, skip_nests=True
            )
            source_to_destination_path = self.calculate_path(
                source_waypoint_name=source_nest.safe_loc,
                destination_waypoint_name=destination_nest.safe_loc,
            )
            source_to_destination_commands = self.convert_path_to_commands(
                path=source_to_destination_path, params=params
            )

            self.runSequence(current_to_source_commands)
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
            self.runSequence(source_to_destination_commands)
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
            if "fridge_hotel" in params.destination_nest.nest:
                print("fridge_hotel")
                #button movement
                self.runSequence(
                    [
                        Command.Move(waypoint="fridge_nest_safe", motion_profile_id=params.motion_profile_id),
                        Command.Move(waypoint="fridge_button_3", motion_profile_id=params.motion_profile_id),
                        Command.Move(waypoint="fridge_button_2", motion_profile_id=params.motion_profile_id),
                        Command.Move(waypoint="fridge_button_1", motion_profile_id=params.motion_profile_id),
                        Command.Move(waypoint="fridge_nest_safe", motion_profile_id=params.motion_profile_id),
                        Command.Move(waypoint="pf400_portrait_nest_approach", motion_profile_id=params.motion_profile_id),
                        Command.Move(waypoint="rp_hotel_safe_nest", motion_profile_id=params.motion_profile_id),
                      
                        
                    ]
                )
                # current_to_source_path = self.calculate_path(
                #     source_waypoint_name="fridge_nest_safe",
                #     destination_waypoint_name="rp_hotel_safe_nest",
                # )
                # source_to_destination_commands = self.convert_path_to_commands(
                #     path=source_to_destination_path, params=params
                # )

                # self.runSequence(current_to_source_commands)
                # self.retrieve_plate(
                #     source_nest=params.source_nest.nest,
                #     grasp_params=params.grasp_params,
                #     nest_offset=(
                #         params.source_nest.x_offset,
                #         params.source_nest.y_offset,
                #         params.source_nest.z_offset,
                #     ),
                #     motion_profile_id=params.motion_profile_id,
                #     grip_width=params.grip_width,
                # )
                # self.runSequence(source_to_destination_commands)
                # self.dropoff_plate(
                #     destination_nest=params.destination_nest.nest,
                #     release_params=params.release_params,
                #     nest_offset=(
                #         params.destination_nest.x_offset,
                #         params.destination_nest.y_offset,
                #         params.destination_nest.z_offset,
                #     ),
                #     motion_profile_id=params.motion_profile_id,
                #     grip_width=params.grip_width,
                # )
                # if "fridge_hotel" in params.destination_nest.nest:
                #     current_to_source_path = self.calculate_path(
                #         source_waypoint_name="fridge_button_3",
                #         destination_waypoint_name="rp_hotel_safe_nest",
                #     )
                #     current_to_source_commands = self.convert_path_to_commands(
                #         path=current_to_source_path, params=params, skip_nests=True
                #     )
                #     self.runSequence(current_to_source_commands)
        except Exception as exc:
            logging.exception(exc)
            response.response = INVALID_ARGUMENTS
        return response

    def calculate_path(
        self, source_waypoint_name: str, destination_waypoint_name: str
    ) -> list[str]:
        return nx.shortest_path(  # type: ignore
            G=self.graph, source=source_waypoint_name, target=destination_waypoint_name
        )

    def convert_path_to_commands(
        self, path: list[str], params: Command.SmartTransfer, skip_nests: bool = False
    ) -> list[message.Message]:
        """Converts a path to a list of commands.
        Makes a few important assumptions:
        - The only nests in the path are regrip nests
        - The first nest in the path will do ungrip
        - The second nest in the path will do grip
        """
        commands: list[message.Message] = []
        for i, waypoint_name in enumerate(path):
            waypoint_type: t.Literal["safe_point", "nest", "wait"] = self.type_of(
                waypoint_name=waypoint_name
            )
            if waypoint_type == "safe_point":
                commands.append(
                    Command.Move(
                        waypoint=waypoint_name,
                        motion_profile_id=params.motion_profile_id,
                    )
                )
            elif waypoint_type == "nest":
                if skip_nests:
                    continue
                nest: Nest = self.waypoints.nests[waypoint_name]
                if i == 0:
                    grip_status = "release"
                elif self.type_of(path[i - 1]) == "nest":
                    grip_status = "grasp"
                else:
                    grip_status = "release"
                if grip_status == "release":
                    release: Command.ReleasePlate
                    if not params.release_params or (params.release_params.width == 0):
                        tmp_release: Union[Command.GraspPlate, Command.ReleasePlate] = (
                            self.plate_handling_params[nest.orientation]["release"]
                        )
                        if isinstance(tmp_release, Command.ReleasePlate):
                            release = tmp_release
                        else:
                            raise Exception("Invalid release params")
                    else:
                        release = params.release_params
                else:
                    grasp: Command.GraspPlate
                    if not params.grasp_params or (params.grasp_params.width == 0):
                        tmp_grasp: Union[Command.GraspPlate,Command.ReleasePlate] = (
                            self.plate_handling_params[nest.orientation]["grasp"]
                        )
                        if isinstance(tmp_grasp, Command.GraspPlate):
                            grasp = tmp_grasp
                        else:
                            raise Exception("Invalid grasp params")
                    else:
                        grasp = params.grasp_params
                if grip_status == "grasp":
                    # Pre-release gripper before grasp to avoid collision
                    commands.append(self.plate_handling_params["landscape"]["release"])
                commands.append(
                    Command.Approach(
                        nest=waypoint_name,
                        x_offset=params.source_nest.x_offset,
                        y_offset=params.source_nest.y_offset,
                        z_offset=params.source_nest.z_offset,
                        motion_profile_id=params.motion_profile_id,
                    )
                )
                commands.append(release if grip_status == "release" else grasp)
                commands.append(
                    Command.Leave(
                        nest=waypoint_name,
                        x_offset=params.source_nest.x_offset,
                        y_offset=params.source_nest.y_offset,
                        z_offset=params.source_nest.z_offset,
                        motion_profile_id=params.motion_profile_id,
                    )
                )
            elif waypoint_type == "wait":
                commands.append(Command.Wait(duration=int(waypoint_name.split("_")[1])))
        return commands

    def type_of(self, waypoint_name: str) -> t.Literal["safe_point", "nest", "wait"]:
        if waypoint_name in self.waypoints.nests:
            return "nest"
        elif waypoint_name in self.waypoints.locations:
            return "safe_point"
        elif waypoint_name.startswith("wait"):
            return "wait"
        else:
            raise KeyError("Waypoint not found: " + waypoint_name)

    def find_nearest_safe_point(self) -> str:
        current_position = Coordinate(self.driver.get_cur_joint_loc_string())
        logging.debug("Current position: %s", current_position)

        nearest_safe_point: str = ""
        nearest_safe_point_distance: float = float("inf")
        for safe_point_name, safe_point in self.waypoints.locations.items():
            logging.debug("Checking safe point %s", safe_point_name)
            safe_point_position = safe_point.loc
            distance = current_position.distance_to(safe_point_position)
            if distance < nearest_safe_point_distance:
                nearest_safe_point = safe_point_name
                nearest_safe_point_distance = distance
        return nearest_safe_point

    def Wait(self, params: Command.Wait) -> None:
        self.driver.wait(duration=params.duration)

    def EstimateGraspPlate(self, params: Command.GraspPlate) -> int:
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
    

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    parser = argparse.ArgumentParser()
    parser.add_argument('--port')
    args = parser.parse_args()
    if not args.port:
         raise RuntimeWarning("Port must be provided...")
    serve(Pf400Server(), str(args.port))
