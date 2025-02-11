/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Struct } from "../../google/protobuf/struct";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.pf400";

export interface Command {
  move?: Command_Move | undefined;
  grasp_plate?: Command_GraspPlate | undefined;
  release_plate?: Command_ReleasePlate | undefined;
  transfer?: Command_Transfer | undefined;
  wait?: Command_Wait | undefined;
  release?: Command_Release | undefined;
  engage?: Command_Engage | undefined;
  retract?: Command_Retract | undefined;
  run_sequence?: Command_RunSequence | undefined;
  retrieve_plate?: Command_RetrievePlate | undefined;
  dropoff_plate?: Command_DropOffPlate | undefined;
  pick_lid?: Command_PickLid | undefined;
  place_lid?: Command_PlaceLid | undefined;
  get_current_location?: Command_GetCurrentLocation | undefined;
  jog?: Command_Jog | undefined;
  raw_command?: Command_RawCommand | undefined;
  register_motion_profile?: Command_RegisterMotionProfile | undefined;
  load_waypoints?: Command_LoadWaypoints | undefined;
  load_labware?: Command_LoadLabware | undefined;
}

export interface Command_RawCommand {
  command: string;
}

export interface Command_GetCurrentLocation {}

export interface Command_Jog {
  axis: string;
  distance: number;
}

export interface Command_PickLid {
  labware: string;
  location: string;
  motion_profile_id?: number | undefined;
  pick_from_plate?: boolean | undefined;
}

export interface Command_PlaceLid {
  labware: string;
  location: string;
  motion_profile_id?: number | undefined;
  place_on_plate?: boolean | undefined;
}

export interface Command_RetrievePlate {
  labware: string;
  location: string;
  z_offset?: number | undefined;
  motion_profile_id?: number | undefined;
}

export interface Command_DropOffPlate {
  labware: string;
  location: string;
  z_offset?: number | undefined;
  motion_profile_id?: number | undefined;
}

export interface Command_RunSequence {
  sequence_name: string;
  labware: string;
}

export interface Command_Engage {}

export interface Command_Release {}

export interface Command_Retract {}

export interface Command_Move {
  name: string;
  motion_profile_id?: number | undefined;
  z_offset?: number | undefined;
}

export interface Command_GraspPlate {
  width: number;
  speed: number;
  force: number;
}

export interface Command_ReleasePlate {
  width: number;
  speed: number;
}

export interface Command_Transfer {
  source_nest: string;
  destination_nest: string;
  labware: string;
  motion_profile_id?: number | undefined;
}

export interface Command_Wait {
  duration: number;
}

export interface Command_RegisterMotionProfile {
  id: number;
  speed: number;
  speed2: number;
  accel: number;
  decel: number;
  accel_ramp: number;
  decel_ramp: number;
  inrange: number;
  straight: number;
}

export interface Command_LoadWaypoints {
  waypoints: { [key: string]: any } | undefined;
}

export interface Command_LoadLabware {
  labwares: { [key: string]: any } | undefined;
}

export interface Config {
  host: string;
  port: number;
  joints: number;
}

function createBaseCommand(): Command {
  return {
    move: undefined,
    grasp_plate: undefined,
    release_plate: undefined,
    transfer: undefined,
    wait: undefined,
    release: undefined,
    engage: undefined,
    retract: undefined,
    run_sequence: undefined,
    retrieve_plate: undefined,
    dropoff_plate: undefined,
    pick_lid: undefined,
    place_lid: undefined,
    get_current_location: undefined,
    jog: undefined,
    raw_command: undefined,
    register_motion_profile: undefined,
    load_waypoints: undefined,
    load_labware: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.move !== undefined) {
      Command_Move.encode(message.move, writer.uint32(10).fork()).ldelim();
    }
    if (message.grasp_plate !== undefined) {
      Command_GraspPlate.encode(message.grasp_plate, writer.uint32(18).fork()).ldelim();
    }
    if (message.release_plate !== undefined) {
      Command_ReleasePlate.encode(message.release_plate, writer.uint32(26).fork()).ldelim();
    }
    if (message.transfer !== undefined) {
      Command_Transfer.encode(message.transfer, writer.uint32(34).fork()).ldelim();
    }
    if (message.wait !== undefined) {
      Command_Wait.encode(message.wait, writer.uint32(42).fork()).ldelim();
    }
    if (message.release !== undefined) {
      Command_Release.encode(message.release, writer.uint32(50).fork()).ldelim();
    }
    if (message.engage !== undefined) {
      Command_Engage.encode(message.engage, writer.uint32(58).fork()).ldelim();
    }
    if (message.retract !== undefined) {
      Command_Retract.encode(message.retract, writer.uint32(66).fork()).ldelim();
    }
    if (message.run_sequence !== undefined) {
      Command_RunSequence.encode(message.run_sequence, writer.uint32(74).fork()).ldelim();
    }
    if (message.retrieve_plate !== undefined) {
      Command_RetrievePlate.encode(message.retrieve_plate, writer.uint32(82).fork()).ldelim();
    }
    if (message.dropoff_plate !== undefined) {
      Command_DropOffPlate.encode(message.dropoff_plate, writer.uint32(90).fork()).ldelim();
    }
    if (message.pick_lid !== undefined) {
      Command_PickLid.encode(message.pick_lid, writer.uint32(98).fork()).ldelim();
    }
    if (message.place_lid !== undefined) {
      Command_PlaceLid.encode(message.place_lid, writer.uint32(106).fork()).ldelim();
    }
    if (message.get_current_location !== undefined) {
      Command_GetCurrentLocation.encode(
        message.get_current_location,
        writer.uint32(114).fork(),
      ).ldelim();
    }
    if (message.jog !== undefined) {
      Command_Jog.encode(message.jog, writer.uint32(122).fork()).ldelim();
    }
    if (message.raw_command !== undefined) {
      Command_RawCommand.encode(message.raw_command, writer.uint32(130).fork()).ldelim();
    }
    if (message.register_motion_profile !== undefined) {
      Command_RegisterMotionProfile.encode(
        message.register_motion_profile,
        writer.uint32(138).fork(),
      ).ldelim();
    }
    if (message.load_waypoints !== undefined) {
      Command_LoadWaypoints.encode(message.load_waypoints, writer.uint32(146).fork()).ldelim();
    }
    if (message.load_labware !== undefined) {
      Command_LoadLabware.encode(message.load_labware, writer.uint32(154).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.move = Command_Move.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.grasp_plate = Command_GraspPlate.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.release_plate = Command_ReleasePlate.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.transfer = Command_Transfer.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.wait = Command_Wait.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.release = Command_Release.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.engage = Command_Engage.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.retract = Command_Retract.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.run_sequence = Command_RunSequence.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.retrieve_plate = Command_RetrievePlate.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.dropoff_plate = Command_DropOffPlate.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.pick_lid = Command_PickLid.decode(reader, reader.uint32());
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.place_lid = Command_PlaceLid.decode(reader, reader.uint32());
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.get_current_location = Command_GetCurrentLocation.decode(reader, reader.uint32());
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.jog = Command_Jog.decode(reader, reader.uint32());
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.raw_command = Command_RawCommand.decode(reader, reader.uint32());
          continue;
        case 17:
          if (tag !== 138) {
            break;
          }

          message.register_motion_profile = Command_RegisterMotionProfile.decode(
            reader,
            reader.uint32(),
          );
          continue;
        case 18:
          if (tag !== 146) {
            break;
          }

          message.load_waypoints = Command_LoadWaypoints.decode(reader, reader.uint32());
          continue;
        case 19:
          if (tag !== 154) {
            break;
          }

          message.load_labware = Command_LoadLabware.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command {
    return {
      move: isSet(object.move) ? Command_Move.fromJSON(object.move) : undefined,
      grasp_plate: isSet(object.grasp_plate)
        ? Command_GraspPlate.fromJSON(object.grasp_plate)
        : undefined,
      release_plate: isSet(object.release_plate)
        ? Command_ReleasePlate.fromJSON(object.release_plate)
        : undefined,
      transfer: isSet(object.transfer) ? Command_Transfer.fromJSON(object.transfer) : undefined,
      wait: isSet(object.wait) ? Command_Wait.fromJSON(object.wait) : undefined,
      release: isSet(object.release) ? Command_Release.fromJSON(object.release) : undefined,
      engage: isSet(object.engage) ? Command_Engage.fromJSON(object.engage) : undefined,
      retract: isSet(object.retract) ? Command_Retract.fromJSON(object.retract) : undefined,
      run_sequence: isSet(object.run_sequence)
        ? Command_RunSequence.fromJSON(object.run_sequence)
        : undefined,
      retrieve_plate: isSet(object.retrieve_plate)
        ? Command_RetrievePlate.fromJSON(object.retrieve_plate)
        : undefined,
      dropoff_plate: isSet(object.dropoff_plate)
        ? Command_DropOffPlate.fromJSON(object.dropoff_plate)
        : undefined,
      pick_lid: isSet(object.pick_lid) ? Command_PickLid.fromJSON(object.pick_lid) : undefined,
      place_lid: isSet(object.place_lid) ? Command_PlaceLid.fromJSON(object.place_lid) : undefined,
      get_current_location: isSet(object.get_current_location)
        ? Command_GetCurrentLocation.fromJSON(object.get_current_location)
        : undefined,
      jog: isSet(object.jog) ? Command_Jog.fromJSON(object.jog) : undefined,
      raw_command: isSet(object.raw_command)
        ? Command_RawCommand.fromJSON(object.raw_command)
        : undefined,
      register_motion_profile: isSet(object.register_motion_profile)
        ? Command_RegisterMotionProfile.fromJSON(object.register_motion_profile)
        : undefined,
      load_waypoints: isSet(object.load_waypoints)
        ? Command_LoadWaypoints.fromJSON(object.load_waypoints)
        : undefined,
      load_labware: isSet(object.load_labware)
        ? Command_LoadLabware.fromJSON(object.load_labware)
        : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.move !== undefined &&
      (obj.move = message.move ? Command_Move.toJSON(message.move) : undefined);
    message.grasp_plate !== undefined &&
      (obj.grasp_plate = message.grasp_plate
        ? Command_GraspPlate.toJSON(message.grasp_plate)
        : undefined);
    message.release_plate !== undefined &&
      (obj.release_plate = message.release_plate
        ? Command_ReleasePlate.toJSON(message.release_plate)
        : undefined);
    message.transfer !== undefined &&
      (obj.transfer = message.transfer ? Command_Transfer.toJSON(message.transfer) : undefined);
    message.wait !== undefined &&
      (obj.wait = message.wait ? Command_Wait.toJSON(message.wait) : undefined);
    message.release !== undefined &&
      (obj.release = message.release ? Command_Release.toJSON(message.release) : undefined);
    message.engage !== undefined &&
      (obj.engage = message.engage ? Command_Engage.toJSON(message.engage) : undefined);
    message.retract !== undefined &&
      (obj.retract = message.retract ? Command_Retract.toJSON(message.retract) : undefined);
    message.run_sequence !== undefined &&
      (obj.run_sequence = message.run_sequence
        ? Command_RunSequence.toJSON(message.run_sequence)
        : undefined);
    message.retrieve_plate !== undefined &&
      (obj.retrieve_plate = message.retrieve_plate
        ? Command_RetrievePlate.toJSON(message.retrieve_plate)
        : undefined);
    message.dropoff_plate !== undefined &&
      (obj.dropoff_plate = message.dropoff_plate
        ? Command_DropOffPlate.toJSON(message.dropoff_plate)
        : undefined);
    message.pick_lid !== undefined &&
      (obj.pick_lid = message.pick_lid ? Command_PickLid.toJSON(message.pick_lid) : undefined);
    message.place_lid !== undefined &&
      (obj.place_lid = message.place_lid ? Command_PlaceLid.toJSON(message.place_lid) : undefined);
    message.get_current_location !== undefined &&
      (obj.get_current_location = message.get_current_location
        ? Command_GetCurrentLocation.toJSON(message.get_current_location)
        : undefined);
    message.jog !== undefined &&
      (obj.jog = message.jog ? Command_Jog.toJSON(message.jog) : undefined);
    message.raw_command !== undefined &&
      (obj.raw_command = message.raw_command
        ? Command_RawCommand.toJSON(message.raw_command)
        : undefined);
    message.register_motion_profile !== undefined &&
      (obj.register_motion_profile = message.register_motion_profile
        ? Command_RegisterMotionProfile.toJSON(message.register_motion_profile)
        : undefined);
    message.load_waypoints !== undefined &&
      (obj.load_waypoints = message.load_waypoints
        ? Command_LoadWaypoints.toJSON(message.load_waypoints)
        : undefined);
    message.load_labware !== undefined &&
      (obj.load_labware = message.load_labware
        ? Command_LoadLabware.toJSON(message.load_labware)
        : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.move =
      object.move !== undefined && object.move !== null
        ? Command_Move.fromPartial(object.move)
        : undefined;
    message.grasp_plate =
      object.grasp_plate !== undefined && object.grasp_plate !== null
        ? Command_GraspPlate.fromPartial(object.grasp_plate)
        : undefined;
    message.release_plate =
      object.release_plate !== undefined && object.release_plate !== null
        ? Command_ReleasePlate.fromPartial(object.release_plate)
        : undefined;
    message.transfer =
      object.transfer !== undefined && object.transfer !== null
        ? Command_Transfer.fromPartial(object.transfer)
        : undefined;
    message.wait =
      object.wait !== undefined && object.wait !== null
        ? Command_Wait.fromPartial(object.wait)
        : undefined;
    message.release =
      object.release !== undefined && object.release !== null
        ? Command_Release.fromPartial(object.release)
        : undefined;
    message.engage =
      object.engage !== undefined && object.engage !== null
        ? Command_Engage.fromPartial(object.engage)
        : undefined;
    message.retract =
      object.retract !== undefined && object.retract !== null
        ? Command_Retract.fromPartial(object.retract)
        : undefined;
    message.run_sequence =
      object.run_sequence !== undefined && object.run_sequence !== null
        ? Command_RunSequence.fromPartial(object.run_sequence)
        : undefined;
    message.retrieve_plate =
      object.retrieve_plate !== undefined && object.retrieve_plate !== null
        ? Command_RetrievePlate.fromPartial(object.retrieve_plate)
        : undefined;
    message.dropoff_plate =
      object.dropoff_plate !== undefined && object.dropoff_plate !== null
        ? Command_DropOffPlate.fromPartial(object.dropoff_plate)
        : undefined;
    message.pick_lid =
      object.pick_lid !== undefined && object.pick_lid !== null
        ? Command_PickLid.fromPartial(object.pick_lid)
        : undefined;
    message.place_lid =
      object.place_lid !== undefined && object.place_lid !== null
        ? Command_PlaceLid.fromPartial(object.place_lid)
        : undefined;
    message.get_current_location =
      object.get_current_location !== undefined && object.get_current_location !== null
        ? Command_GetCurrentLocation.fromPartial(object.get_current_location)
        : undefined;
    message.jog =
      object.jog !== undefined && object.jog !== null
        ? Command_Jog.fromPartial(object.jog)
        : undefined;
    message.raw_command =
      object.raw_command !== undefined && object.raw_command !== null
        ? Command_RawCommand.fromPartial(object.raw_command)
        : undefined;
    message.register_motion_profile =
      object.register_motion_profile !== undefined && object.register_motion_profile !== null
        ? Command_RegisterMotionProfile.fromPartial(object.register_motion_profile)
        : undefined;
    message.load_waypoints =
      object.load_waypoints !== undefined && object.load_waypoints !== null
        ? Command_LoadWaypoints.fromPartial(object.load_waypoints)
        : undefined;
    message.load_labware =
      object.load_labware !== undefined && object.load_labware !== null
        ? Command_LoadLabware.fromPartial(object.load_labware)
        : undefined;
    return message;
  },
};

function createBaseCommand_RawCommand(): Command_RawCommand {
  return { command: "" };
}

export const Command_RawCommand = {
  encode(message: Command_RawCommand, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.command !== "") {
      writer.uint32(10).string(message.command);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_RawCommand {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_RawCommand();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.command = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_RawCommand {
    return { command: isSet(object.command) ? String(object.command) : "" };
  },

  toJSON(message: Command_RawCommand): unknown {
    const obj: any = {};
    message.command !== undefined && (obj.command = message.command);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RawCommand>, I>>(base?: I): Command_RawCommand {
    return Command_RawCommand.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RawCommand>, I>>(object: I): Command_RawCommand {
    const message = createBaseCommand_RawCommand();
    message.command = object.command ?? "";
    return message;
  },
};

function createBaseCommand_GetCurrentLocation(): Command_GetCurrentLocation {
  return {};
}

export const Command_GetCurrentLocation = {
  encode(_: Command_GetCurrentLocation, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetCurrentLocation {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetCurrentLocation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): Command_GetCurrentLocation {
    return {};
  },

  toJSON(_: Command_GetCurrentLocation): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetCurrentLocation>, I>>(
    base?: I,
  ): Command_GetCurrentLocation {
    return Command_GetCurrentLocation.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetCurrentLocation>, I>>(
    _: I,
  ): Command_GetCurrentLocation {
    const message = createBaseCommand_GetCurrentLocation();
    return message;
  },
};

function createBaseCommand_Jog(): Command_Jog {
  return { axis: "", distance: 0 };
}

export const Command_Jog = {
  encode(message: Command_Jog, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.axis !== "") {
      writer.uint32(10).string(message.axis);
    }
    if (message.distance !== 0) {
      writer.uint32(21).float(message.distance);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Jog {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Jog();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.axis = reader.string();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.distance = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Jog {
    return {
      axis: isSet(object.axis) ? String(object.axis) : "",
      distance: isSet(object.distance) ? Number(object.distance) : 0,
    };
  },

  toJSON(message: Command_Jog): unknown {
    const obj: any = {};
    message.axis !== undefined && (obj.axis = message.axis);
    message.distance !== undefined && (obj.distance = message.distance);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Jog>, I>>(base?: I): Command_Jog {
    return Command_Jog.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Jog>, I>>(object: I): Command_Jog {
    const message = createBaseCommand_Jog();
    message.axis = object.axis ?? "";
    message.distance = object.distance ?? 0;
    return message;
  },
};

function createBaseCommand_PickLid(): Command_PickLid {
  return { labware: "", location: "", motion_profile_id: undefined, pick_from_plate: undefined };
}

export const Command_PickLid = {
  encode(message: Command_PickLid, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.labware !== "") {
      writer.uint32(10).string(message.labware);
    }
    if (message.location !== "") {
      writer.uint32(18).string(message.location);
    }
    if (message.motion_profile_id !== undefined) {
      writer.uint32(24).int32(message.motion_profile_id);
    }
    if (message.pick_from_plate !== undefined) {
      writer.uint32(32).bool(message.pick_from_plate);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_PickLid {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_PickLid();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.labware = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.location = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.motion_profile_id = reader.int32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.pick_from_plate = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_PickLid {
    return {
      labware: isSet(object.labware) ? String(object.labware) : "",
      location: isSet(object.location) ? String(object.location) : "",
      motion_profile_id: isSet(object.motion_profile_id)
        ? Number(object.motion_profile_id)
        : undefined,
      pick_from_plate: isSet(object.pick_from_plate) ? Boolean(object.pick_from_plate) : undefined,
    };
  },

  toJSON(message: Command_PickLid): unknown {
    const obj: any = {};
    message.labware !== undefined && (obj.labware = message.labware);
    message.location !== undefined && (obj.location = message.location);
    message.motion_profile_id !== undefined &&
      (obj.motion_profile_id = Math.round(message.motion_profile_id));
    message.pick_from_plate !== undefined && (obj.pick_from_plate = message.pick_from_plate);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_PickLid>, I>>(base?: I): Command_PickLid {
    return Command_PickLid.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_PickLid>, I>>(object: I): Command_PickLid {
    const message = createBaseCommand_PickLid();
    message.labware = object.labware ?? "";
    message.location = object.location ?? "";
    message.motion_profile_id = object.motion_profile_id ?? undefined;
    message.pick_from_plate = object.pick_from_plate ?? undefined;
    return message;
  },
};

function createBaseCommand_PlaceLid(): Command_PlaceLid {
  return { labware: "", location: "", motion_profile_id: undefined, place_on_plate: undefined };
}

export const Command_PlaceLid = {
  encode(message: Command_PlaceLid, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.labware !== "") {
      writer.uint32(10).string(message.labware);
    }
    if (message.location !== "") {
      writer.uint32(18).string(message.location);
    }
    if (message.motion_profile_id !== undefined) {
      writer.uint32(24).int32(message.motion_profile_id);
    }
    if (message.place_on_plate !== undefined) {
      writer.uint32(32).bool(message.place_on_plate);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_PlaceLid {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_PlaceLid();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.labware = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.location = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.motion_profile_id = reader.int32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.place_on_plate = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_PlaceLid {
    return {
      labware: isSet(object.labware) ? String(object.labware) : "",
      location: isSet(object.location) ? String(object.location) : "",
      motion_profile_id: isSet(object.motion_profile_id)
        ? Number(object.motion_profile_id)
        : undefined,
      place_on_plate: isSet(object.place_on_plate) ? Boolean(object.place_on_plate) : undefined,
    };
  },

  toJSON(message: Command_PlaceLid): unknown {
    const obj: any = {};
    message.labware !== undefined && (obj.labware = message.labware);
    message.location !== undefined && (obj.location = message.location);
    message.motion_profile_id !== undefined &&
      (obj.motion_profile_id = Math.round(message.motion_profile_id));
    message.place_on_plate !== undefined && (obj.place_on_plate = message.place_on_plate);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_PlaceLid>, I>>(base?: I): Command_PlaceLid {
    return Command_PlaceLid.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_PlaceLid>, I>>(object: I): Command_PlaceLid {
    const message = createBaseCommand_PlaceLid();
    message.labware = object.labware ?? "";
    message.location = object.location ?? "";
    message.motion_profile_id = object.motion_profile_id ?? undefined;
    message.place_on_plate = object.place_on_plate ?? undefined;
    return message;
  },
};

function createBaseCommand_RetrievePlate(): Command_RetrievePlate {
  return { labware: "", location: "", z_offset: undefined, motion_profile_id: undefined };
}

export const Command_RetrievePlate = {
  encode(message: Command_RetrievePlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.labware !== "") {
      writer.uint32(10).string(message.labware);
    }
    if (message.location !== "") {
      writer.uint32(18).string(message.location);
    }
    if (message.z_offset !== undefined) {
      writer.uint32(29).float(message.z_offset);
    }
    if (message.motion_profile_id !== undefined) {
      writer.uint32(32).int32(message.motion_profile_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_RetrievePlate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_RetrievePlate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.labware = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.location = reader.string();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.z_offset = reader.float();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.motion_profile_id = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_RetrievePlate {
    return {
      labware: isSet(object.labware) ? String(object.labware) : "",
      location: isSet(object.location) ? String(object.location) : "",
      z_offset: isSet(object.z_offset) ? Number(object.z_offset) : undefined,
      motion_profile_id: isSet(object.motion_profile_id)
        ? Number(object.motion_profile_id)
        : undefined,
    };
  },

  toJSON(message: Command_RetrievePlate): unknown {
    const obj: any = {};
    message.labware !== undefined && (obj.labware = message.labware);
    message.location !== undefined && (obj.location = message.location);
    message.z_offset !== undefined && (obj.z_offset = message.z_offset);
    message.motion_profile_id !== undefined &&
      (obj.motion_profile_id = Math.round(message.motion_profile_id));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RetrievePlate>, I>>(base?: I): Command_RetrievePlate {
    return Command_RetrievePlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RetrievePlate>, I>>(
    object: I,
  ): Command_RetrievePlate {
    const message = createBaseCommand_RetrievePlate();
    message.labware = object.labware ?? "";
    message.location = object.location ?? "";
    message.z_offset = object.z_offset ?? undefined;
    message.motion_profile_id = object.motion_profile_id ?? undefined;
    return message;
  },
};

function createBaseCommand_DropOffPlate(): Command_DropOffPlate {
  return { labware: "", location: "", z_offset: undefined, motion_profile_id: undefined };
}

export const Command_DropOffPlate = {
  encode(message: Command_DropOffPlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.labware !== "") {
      writer.uint32(10).string(message.labware);
    }
    if (message.location !== "") {
      writer.uint32(18).string(message.location);
    }
    if (message.z_offset !== undefined) {
      writer.uint32(29).float(message.z_offset);
    }
    if (message.motion_profile_id !== undefined) {
      writer.uint32(40).int32(message.motion_profile_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_DropOffPlate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_DropOffPlate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.labware = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.location = reader.string();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.z_offset = reader.float();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.motion_profile_id = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_DropOffPlate {
    return {
      labware: isSet(object.labware) ? String(object.labware) : "",
      location: isSet(object.location) ? String(object.location) : "",
      z_offset: isSet(object.z_offset) ? Number(object.z_offset) : undefined,
      motion_profile_id: isSet(object.motion_profile_id)
        ? Number(object.motion_profile_id)
        : undefined,
    };
  },

  toJSON(message: Command_DropOffPlate): unknown {
    const obj: any = {};
    message.labware !== undefined && (obj.labware = message.labware);
    message.location !== undefined && (obj.location = message.location);
    message.z_offset !== undefined && (obj.z_offset = message.z_offset);
    message.motion_profile_id !== undefined &&
      (obj.motion_profile_id = Math.round(message.motion_profile_id));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_DropOffPlate>, I>>(base?: I): Command_DropOffPlate {
    return Command_DropOffPlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_DropOffPlate>, I>>(
    object: I,
  ): Command_DropOffPlate {
    const message = createBaseCommand_DropOffPlate();
    message.labware = object.labware ?? "";
    message.location = object.location ?? "";
    message.z_offset = object.z_offset ?? undefined;
    message.motion_profile_id = object.motion_profile_id ?? undefined;
    return message;
  },
};

function createBaseCommand_RunSequence(): Command_RunSequence {
  return { sequence_name: "", labware: "" };
}

export const Command_RunSequence = {
  encode(message: Command_RunSequence, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sequence_name !== "") {
      writer.uint32(10).string(message.sequence_name);
    }
    if (message.labware !== "") {
      writer.uint32(18).string(message.labware);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_RunSequence {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_RunSequence();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.sequence_name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.labware = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_RunSequence {
    return {
      sequence_name: isSet(object.sequence_name) ? String(object.sequence_name) : "",
      labware: isSet(object.labware) ? String(object.labware) : "",
    };
  },

  toJSON(message: Command_RunSequence): unknown {
    const obj: any = {};
    message.sequence_name !== undefined && (obj.sequence_name = message.sequence_name);
    message.labware !== undefined && (obj.labware = message.labware);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RunSequence>, I>>(base?: I): Command_RunSequence {
    return Command_RunSequence.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RunSequence>, I>>(
    object: I,
  ): Command_RunSequence {
    const message = createBaseCommand_RunSequence();
    message.sequence_name = object.sequence_name ?? "";
    message.labware = object.labware ?? "";
    return message;
  },
};

function createBaseCommand_Engage(): Command_Engage {
  return {};
}

export const Command_Engage = {
  encode(_: Command_Engage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Engage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Engage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): Command_Engage {
    return {};
  },

  toJSON(_: Command_Engage): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Engage>, I>>(base?: I): Command_Engage {
    return Command_Engage.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Engage>, I>>(_: I): Command_Engage {
    const message = createBaseCommand_Engage();
    return message;
  },
};

function createBaseCommand_Release(): Command_Release {
  return {};
}

export const Command_Release = {
  encode(_: Command_Release, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Release {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Release();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): Command_Release {
    return {};
  },

  toJSON(_: Command_Release): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Release>, I>>(base?: I): Command_Release {
    return Command_Release.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Release>, I>>(_: I): Command_Release {
    const message = createBaseCommand_Release();
    return message;
  },
};

function createBaseCommand_Retract(): Command_Retract {
  return {};
}

export const Command_Retract = {
  encode(_: Command_Retract, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Retract {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Retract();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): Command_Retract {
    return {};
  },

  toJSON(_: Command_Retract): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Retract>, I>>(base?: I): Command_Retract {
    return Command_Retract.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Retract>, I>>(_: I): Command_Retract {
    const message = createBaseCommand_Retract();
    return message;
  },
};

function createBaseCommand_Move(): Command_Move {
  return { name: "", motion_profile_id: undefined, z_offset: undefined };
}

export const Command_Move = {
  encode(message: Command_Move, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.motion_profile_id !== undefined) {
      writer.uint32(16).int32(message.motion_profile_id);
    }
    if (message.z_offset !== undefined) {
      writer.uint32(24).int32(message.z_offset);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Move {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Move();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.motion_profile_id = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.z_offset = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Move {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      motion_profile_id: isSet(object.motion_profile_id)
        ? Number(object.motion_profile_id)
        : undefined,
      z_offset: isSet(object.z_offset) ? Number(object.z_offset) : undefined,
    };
  },

  toJSON(message: Command_Move): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.motion_profile_id !== undefined &&
      (obj.motion_profile_id = Math.round(message.motion_profile_id));
    message.z_offset !== undefined && (obj.z_offset = Math.round(message.z_offset));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Move>, I>>(base?: I): Command_Move {
    return Command_Move.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Move>, I>>(object: I): Command_Move {
    const message = createBaseCommand_Move();
    message.name = object.name ?? "";
    message.motion_profile_id = object.motion_profile_id ?? undefined;
    message.z_offset = object.z_offset ?? undefined;
    return message;
  },
};

function createBaseCommand_GraspPlate(): Command_GraspPlate {
  return { width: 0, speed: 0, force: 0 };
}

export const Command_GraspPlate = {
  encode(message: Command_GraspPlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.width !== 0) {
      writer.uint32(8).int32(message.width);
    }
    if (message.speed !== 0) {
      writer.uint32(16).int32(message.speed);
    }
    if (message.force !== 0) {
      writer.uint32(24).int32(message.force);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GraspPlate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GraspPlate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.width = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.speed = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.force = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_GraspPlate {
    return {
      width: isSet(object.width) ? Number(object.width) : 0,
      speed: isSet(object.speed) ? Number(object.speed) : 0,
      force: isSet(object.force) ? Number(object.force) : 0,
    };
  },

  toJSON(message: Command_GraspPlate): unknown {
    const obj: any = {};
    message.width !== undefined && (obj.width = Math.round(message.width));
    message.speed !== undefined && (obj.speed = Math.round(message.speed));
    message.force !== undefined && (obj.force = Math.round(message.force));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GraspPlate>, I>>(base?: I): Command_GraspPlate {
    return Command_GraspPlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GraspPlate>, I>>(object: I): Command_GraspPlate {
    const message = createBaseCommand_GraspPlate();
    message.width = object.width ?? 0;
    message.speed = object.speed ?? 0;
    message.force = object.force ?? 0;
    return message;
  },
};

function createBaseCommand_ReleasePlate(): Command_ReleasePlate {
  return { width: 0, speed: 0 };
}

export const Command_ReleasePlate = {
  encode(message: Command_ReleasePlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.width !== 0) {
      writer.uint32(8).int32(message.width);
    }
    if (message.speed !== 0) {
      writer.uint32(16).int32(message.speed);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_ReleasePlate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_ReleasePlate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.width = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.speed = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_ReleasePlate {
    return {
      width: isSet(object.width) ? Number(object.width) : 0,
      speed: isSet(object.speed) ? Number(object.speed) : 0,
    };
  },

  toJSON(message: Command_ReleasePlate): unknown {
    const obj: any = {};
    message.width !== undefined && (obj.width = Math.round(message.width));
    message.speed !== undefined && (obj.speed = Math.round(message.speed));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_ReleasePlate>, I>>(base?: I): Command_ReleasePlate {
    return Command_ReleasePlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ReleasePlate>, I>>(
    object: I,
  ): Command_ReleasePlate {
    const message = createBaseCommand_ReleasePlate();
    message.width = object.width ?? 0;
    message.speed = object.speed ?? 0;
    return message;
  },
};

function createBaseCommand_Transfer(): Command_Transfer {
  return { source_nest: "", destination_nest: "", labware: "", motion_profile_id: undefined };
}

export const Command_Transfer = {
  encode(message: Command_Transfer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.source_nest !== "") {
      writer.uint32(10).string(message.source_nest);
    }
    if (message.destination_nest !== "") {
      writer.uint32(18).string(message.destination_nest);
    }
    if (message.labware !== "") {
      writer.uint32(26).string(message.labware);
    }
    if (message.motion_profile_id !== undefined) {
      writer.uint32(32).int32(message.motion_profile_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Transfer {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Transfer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.source_nest = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.destination_nest = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.labware = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.motion_profile_id = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Transfer {
    return {
      source_nest: isSet(object.source_nest) ? String(object.source_nest) : "",
      destination_nest: isSet(object.destination_nest) ? String(object.destination_nest) : "",
      labware: isSet(object.labware) ? String(object.labware) : "",
      motion_profile_id: isSet(object.motion_profile_id)
        ? Number(object.motion_profile_id)
        : undefined,
    };
  },

  toJSON(message: Command_Transfer): unknown {
    const obj: any = {};
    message.source_nest !== undefined && (obj.source_nest = message.source_nest);
    message.destination_nest !== undefined && (obj.destination_nest = message.destination_nest);
    message.labware !== undefined && (obj.labware = message.labware);
    message.motion_profile_id !== undefined &&
      (obj.motion_profile_id = Math.round(message.motion_profile_id));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Transfer>, I>>(base?: I): Command_Transfer {
    return Command_Transfer.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Transfer>, I>>(object: I): Command_Transfer {
    const message = createBaseCommand_Transfer();
    message.source_nest = object.source_nest ?? "";
    message.destination_nest = object.destination_nest ?? "";
    message.labware = object.labware ?? "";
    message.motion_profile_id = object.motion_profile_id ?? undefined;
    return message;
  },
};

function createBaseCommand_Wait(): Command_Wait {
  return { duration: 0 };
}

export const Command_Wait = {
  encode(message: Command_Wait, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.duration !== 0) {
      writer.uint32(8).int32(message.duration);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Wait {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Wait();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.duration = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Wait {
    return { duration: isSet(object.duration) ? Number(object.duration) : 0 };
  },

  toJSON(message: Command_Wait): unknown {
    const obj: any = {};
    message.duration !== undefined && (obj.duration = Math.round(message.duration));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Wait>, I>>(base?: I): Command_Wait {
    return Command_Wait.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Wait>, I>>(object: I): Command_Wait {
    const message = createBaseCommand_Wait();
    message.duration = object.duration ?? 0;
    return message;
  },
};

function createBaseCommand_RegisterMotionProfile(): Command_RegisterMotionProfile {
  return {
    id: 0,
    speed: 0,
    speed2: 0,
    accel: 0,
    decel: 0,
    accel_ramp: 0,
    decel_ramp: 0,
    inrange: 0,
    straight: 0,
  };
}

export const Command_RegisterMotionProfile = {
  encode(
    message: Command_RegisterMotionProfile,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.speed !== 0) {
      writer.uint32(21).float(message.speed);
    }
    if (message.speed2 !== 0) {
      writer.uint32(29).float(message.speed2);
    }
    if (message.accel !== 0) {
      writer.uint32(37).float(message.accel);
    }
    if (message.decel !== 0) {
      writer.uint32(45).float(message.decel);
    }
    if (message.accel_ramp !== 0) {
      writer.uint32(53).float(message.accel_ramp);
    }
    if (message.decel_ramp !== 0) {
      writer.uint32(61).float(message.decel_ramp);
    }
    if (message.inrange !== 0) {
      writer.uint32(69).float(message.inrange);
    }
    if (message.straight !== 0) {
      writer.uint32(72).int32(message.straight);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_RegisterMotionProfile {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_RegisterMotionProfile();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.speed = reader.float();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.speed2 = reader.float();
          continue;
        case 4:
          if (tag !== 37) {
            break;
          }

          message.accel = reader.float();
          continue;
        case 5:
          if (tag !== 45) {
            break;
          }

          message.decel = reader.float();
          continue;
        case 6:
          if (tag !== 53) {
            break;
          }

          message.accel_ramp = reader.float();
          continue;
        case 7:
          if (tag !== 61) {
            break;
          }

          message.decel_ramp = reader.float();
          continue;
        case 8:
          if (tag !== 69) {
            break;
          }

          message.inrange = reader.float();
          continue;
        case 9:
          if (tag !== 72) {
            break;
          }

          message.straight = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_RegisterMotionProfile {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      speed: isSet(object.speed) ? Number(object.speed) : 0,
      speed2: isSet(object.speed2) ? Number(object.speed2) : 0,
      accel: isSet(object.accel) ? Number(object.accel) : 0,
      decel: isSet(object.decel) ? Number(object.decel) : 0,
      accel_ramp: isSet(object.accel_ramp) ? Number(object.accel_ramp) : 0,
      decel_ramp: isSet(object.decel_ramp) ? Number(object.decel_ramp) : 0,
      inrange: isSet(object.inrange) ? Number(object.inrange) : 0,
      straight: isSet(object.straight) ? Number(object.straight) : 0,
    };
  },

  toJSON(message: Command_RegisterMotionProfile): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.speed !== undefined && (obj.speed = message.speed);
    message.speed2 !== undefined && (obj.speed2 = message.speed2);
    message.accel !== undefined && (obj.accel = message.accel);
    message.decel !== undefined && (obj.decel = message.decel);
    message.accel_ramp !== undefined && (obj.accel_ramp = message.accel_ramp);
    message.decel_ramp !== undefined && (obj.decel_ramp = message.decel_ramp);
    message.inrange !== undefined && (obj.inrange = message.inrange);
    message.straight !== undefined && (obj.straight = Math.round(message.straight));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RegisterMotionProfile>, I>>(
    base?: I,
  ): Command_RegisterMotionProfile {
    return Command_RegisterMotionProfile.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RegisterMotionProfile>, I>>(
    object: I,
  ): Command_RegisterMotionProfile {
    const message = createBaseCommand_RegisterMotionProfile();
    message.id = object.id ?? 0;
    message.speed = object.speed ?? 0;
    message.speed2 = object.speed2 ?? 0;
    message.accel = object.accel ?? 0;
    message.decel = object.decel ?? 0;
    message.accel_ramp = object.accel_ramp ?? 0;
    message.decel_ramp = object.decel_ramp ?? 0;
    message.inrange = object.inrange ?? 0;
    message.straight = object.straight ?? 0;
    return message;
  },
};

function createBaseCommand_LoadWaypoints(): Command_LoadWaypoints {
  return { waypoints: undefined };
}

export const Command_LoadWaypoints = {
  encode(message: Command_LoadWaypoints, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.waypoints !== undefined) {
      Struct.encode(Struct.wrap(message.waypoints), writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_LoadWaypoints {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_LoadWaypoints();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.waypoints = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_LoadWaypoints {
    return { waypoints: isObject(object.waypoints) ? object.waypoints : undefined };
  },

  toJSON(message: Command_LoadWaypoints): unknown {
    const obj: any = {};
    message.waypoints !== undefined && (obj.waypoints = message.waypoints);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_LoadWaypoints>, I>>(base?: I): Command_LoadWaypoints {
    return Command_LoadWaypoints.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_LoadWaypoints>, I>>(
    object: I,
  ): Command_LoadWaypoints {
    const message = createBaseCommand_LoadWaypoints();
    message.waypoints = object.waypoints ?? undefined;
    return message;
  },
};

function createBaseCommand_LoadLabware(): Command_LoadLabware {
  return { labwares: undefined };
}

export const Command_LoadLabware = {
  encode(message: Command_LoadLabware, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.labwares !== undefined) {
      Struct.encode(Struct.wrap(message.labwares), writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_LoadLabware {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_LoadLabware();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.labwares = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_LoadLabware {
    return { labwares: isObject(object.labwares) ? object.labwares : undefined };
  },

  toJSON(message: Command_LoadLabware): unknown {
    const obj: any = {};
    message.labwares !== undefined && (obj.labwares = message.labwares);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_LoadLabware>, I>>(base?: I): Command_LoadLabware {
    return Command_LoadLabware.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_LoadLabware>, I>>(
    object: I,
  ): Command_LoadLabware {
    const message = createBaseCommand_LoadLabware();
    message.labwares = object.labwares ?? undefined;
    return message;
  },
};

function createBaseConfig(): Config {
  return { host: "", port: 0, joints: 0 };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.port !== 0) {
      writer.uint32(16).int32(message.port);
    }
    if (message.joints !== 0) {
      writer.uint32(24).int32(message.joints);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Config {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.host = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.port = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.joints = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Config {
    return {
      host: isSet(object.host) ? String(object.host) : "",
      port: isSet(object.port) ? Number(object.port) : 0,
      joints: isSet(object.joints) ? Number(object.joints) : 0,
    };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.host !== undefined && (obj.host = message.host);
    message.port !== undefined && (obj.port = Math.round(message.port));
    message.joints !== undefined && (obj.joints = Math.round(message.joints));
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.host = object.host ?? "";
    message.port = object.port ?? 0;
    message.joints = object.joints ?? 0;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : T extends {}
        ? { [K in keyof T]?: DeepPartial<T[K]> }
        : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
