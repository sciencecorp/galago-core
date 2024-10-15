/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.pf400";

export interface Command {
  move?: Command_Move | undefined;
  grasp_plate?: Command_GraspPlate | undefined;
  release_plate?: Command_ReleasePlate | undefined;
  approach?: Command_Approach | undefined;
  leave?: Command_Leave | undefined;
  transfer?: Command_Transfer | undefined;
  register_motion_profile?: Command_RegisterMotionProfile | undefined;
  smart_transfer?: Command_SmartTransfer | undefined;
  wait?: Command_Wait | undefined;
  free?: Command_Free | undefined;
  unfree?: Command_UnFree | undefined;
  unwind?: Command_Unwind | undefined;
  run_sequence?: Command_RunSequence | undefined;
  retrieve_plate?: Command_RetrievePlate | undefined;
  dropoff_plate?: Command_DropOffPlate | undefined;
  pick_lid?: Command_PickLid | undefined;
  place_lid?: Command_PlaceLid | undefined;
  get_teachpoints?: Command_GetTeachpoints | undefined;
  get_current_location?: Command_GetCurrentLocation | undefined;
  jog?: Command_Jog | undefined;
  saveTeachpoints?: Command_SaveTeachpoints | undefined;
  raw_command?: Command_RawCommand | undefined;
}

export interface Command_RawCommand {
  command: string;
}

export interface Command_GetCurrentLocation {
}

export interface Command_Jog {
  axis: string;
  distance: number;
}

export interface Command_SaveTeachpoints {
}

export interface Command_GetTeachpoints {
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
  motion_profile_id?: number | undefined;
}

export interface Command_DropOffPlate {
  labware: string;
  location: string;
  motion_profile_id?: number | undefined;
}

export interface Command_RunSequence {
  sequence_name: string;
  labware: string;
}

export interface Command_UnFree {
}

export interface Command_Free {
}

export interface Command_Unwind {
}

export interface Command_Move {
  waypoint: string;
  motion_profile_id?: number | undefined;
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

export interface Command_Approach {
  nest: string;
  x_offset?: number | undefined;
  y_offset?: number | undefined;
  z_offset?: number | undefined;
  motion_profile_id?: number | undefined;
  ignore_safepath?: string | undefined;
}

export interface Command_Leave {
  nest: string;
  x_offset?: number | undefined;
  y_offset?: number | undefined;
  z_offset?: number | undefined;
  motion_profile_id?: number | undefined;
}

export interface Command_Transfer {
  source_nest: Command_Approach | undefined;
  destination_nest: Command_Leave | undefined;
  grasp_params?: Command_GraspPlate | undefined;
  release_params?: Command_ReleasePlate | undefined;
  motion_profile_id?: number | undefined;
  grip_width?: number | undefined;
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

export interface Command_SmartTransfer {
  source_nest: Command_Approach | undefined;
  destination_nest: Command_Leave | undefined;
  grasp_params?: Command_GraspPlate | undefined;
  release_params?: Command_ReleasePlate | undefined;
  motion_profile_id?: number | undefined;
  grip_width?: number | undefined;
}

export interface Command_Wait {
  duration: number;
}

export interface Config {
  host: string;
  port: number;
  location: Config_Location;
  tool_id: string;
  joints: number;
}

export enum Config_Location {
  UNKNOWN_WORKCELL = "UNKNOWN_WORKCELL",
  ULTRALIGHT_WORKCELL = "ULTRALIGHT_WORKCELL",
  BIOLAB_WORKCELL = "BIOLAB_WORKCELL",
  BAYMAX_WORKCELL = "BAYMAX_WORKCELL",
  UNRECOGNIZED = "UNRECOGNIZED",
}

export function config_LocationFromJSON(object: any): Config_Location {
  switch (object) {
    case 0:
    case "UNKNOWN_WORKCELL":
      return Config_Location.UNKNOWN_WORKCELL;
    case 1:
    case "ULTRALIGHT_WORKCELL":
      return Config_Location.ULTRALIGHT_WORKCELL;
    case 2:
    case "BIOLAB_WORKCELL":
      return Config_Location.BIOLAB_WORKCELL;
    case 3:
    case "BAYMAX_WORKCELL":
      return Config_Location.BAYMAX_WORKCELL;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Config_Location.UNRECOGNIZED;
  }
}

export function config_LocationToJSON(object: Config_Location): string {
  switch (object) {
    case Config_Location.UNKNOWN_WORKCELL:
      return "UNKNOWN_WORKCELL";
    case Config_Location.ULTRALIGHT_WORKCELL:
      return "ULTRALIGHT_WORKCELL";
    case Config_Location.BIOLAB_WORKCELL:
      return "BIOLAB_WORKCELL";
    case Config_Location.BAYMAX_WORKCELL:
      return "BAYMAX_WORKCELL";
    case Config_Location.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export function config_LocationToNumber(object: Config_Location): number {
  switch (object) {
    case Config_Location.UNKNOWN_WORKCELL:
      return 0;
    case Config_Location.ULTRALIGHT_WORKCELL:
      return 1;
    case Config_Location.BIOLAB_WORKCELL:
      return 2;
    case Config_Location.BAYMAX_WORKCELL:
      return 3;
    case Config_Location.UNRECOGNIZED:
    default:
      return -1;
  }
}

function createBaseCommand(): Command {
  return {
    move: undefined,
    grasp_plate: undefined,
    release_plate: undefined,
    approach: undefined,
    leave: undefined,
    transfer: undefined,
    register_motion_profile: undefined,
    smart_transfer: undefined,
    wait: undefined,
    free: undefined,
    unfree: undefined,
    unwind: undefined,
    run_sequence: undefined,
    retrieve_plate: undefined,
    dropoff_plate: undefined,
    pick_lid: undefined,
    place_lid: undefined,
    get_teachpoints: undefined,
    get_current_location: undefined,
    jog: undefined,
    saveTeachpoints: undefined,
    raw_command: undefined,
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
    if (message.approach !== undefined) {
      Command_Approach.encode(message.approach, writer.uint32(34).fork()).ldelim();
    }
    if (message.leave !== undefined) {
      Command_Leave.encode(message.leave, writer.uint32(42).fork()).ldelim();
    }
    if (message.transfer !== undefined) {
      Command_Transfer.encode(message.transfer, writer.uint32(50).fork()).ldelim();
    }
    if (message.register_motion_profile !== undefined) {
      Command_RegisterMotionProfile.encode(message.register_motion_profile, writer.uint32(58).fork()).ldelim();
    }
    if (message.smart_transfer !== undefined) {
      Command_SmartTransfer.encode(message.smart_transfer, writer.uint32(66).fork()).ldelim();
    }
    if (message.wait !== undefined) {
      Command_Wait.encode(message.wait, writer.uint32(74).fork()).ldelim();
    }
    if (message.free !== undefined) {
      Command_Free.encode(message.free, writer.uint32(82).fork()).ldelim();
    }
    if (message.unfree !== undefined) {
      Command_UnFree.encode(message.unfree, writer.uint32(90).fork()).ldelim();
    }
    if (message.unwind !== undefined) {
      Command_Unwind.encode(message.unwind, writer.uint32(98).fork()).ldelim();
    }
    if (message.run_sequence !== undefined) {
      Command_RunSequence.encode(message.run_sequence, writer.uint32(106).fork()).ldelim();
    }
    if (message.retrieve_plate !== undefined) {
      Command_RetrievePlate.encode(message.retrieve_plate, writer.uint32(114).fork()).ldelim();
    }
    if (message.dropoff_plate !== undefined) {
      Command_DropOffPlate.encode(message.dropoff_plate, writer.uint32(122).fork()).ldelim();
    }
    if (message.pick_lid !== undefined) {
      Command_PickLid.encode(message.pick_lid, writer.uint32(130).fork()).ldelim();
    }
    if (message.place_lid !== undefined) {
      Command_PlaceLid.encode(message.place_lid, writer.uint32(138).fork()).ldelim();
    }
    if (message.get_teachpoints !== undefined) {
      Command_GetTeachpoints.encode(message.get_teachpoints, writer.uint32(146).fork()).ldelim();
    }
    if (message.get_current_location !== undefined) {
      Command_GetCurrentLocation.encode(message.get_current_location, writer.uint32(154).fork()).ldelim();
    }
    if (message.jog !== undefined) {
      Command_Jog.encode(message.jog, writer.uint32(162).fork()).ldelim();
    }
    if (message.saveTeachpoints !== undefined) {
      Command_SaveTeachpoints.encode(message.saveTeachpoints, writer.uint32(170).fork()).ldelim();
    }
    if (message.raw_command !== undefined) {
      Command_RawCommand.encode(message.raw_command, writer.uint32(178).fork()).ldelim();
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

          message.approach = Command_Approach.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.leave = Command_Leave.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.transfer = Command_Transfer.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.register_motion_profile = Command_RegisterMotionProfile.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.smart_transfer = Command_SmartTransfer.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.wait = Command_Wait.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.free = Command_Free.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.unfree = Command_UnFree.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.unwind = Command_Unwind.decode(reader, reader.uint32());
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.run_sequence = Command_RunSequence.decode(reader, reader.uint32());
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.retrieve_plate = Command_RetrievePlate.decode(reader, reader.uint32());
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.dropoff_plate = Command_DropOffPlate.decode(reader, reader.uint32());
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.pick_lid = Command_PickLid.decode(reader, reader.uint32());
          continue;
        case 17:
          if (tag !== 138) {
            break;
          }

          message.place_lid = Command_PlaceLid.decode(reader, reader.uint32());
          continue;
        case 18:
          if (tag !== 146) {
            break;
          }

          message.get_teachpoints = Command_GetTeachpoints.decode(reader, reader.uint32());
          continue;
        case 19:
          if (tag !== 154) {
            break;
          }

          message.get_current_location = Command_GetCurrentLocation.decode(reader, reader.uint32());
          continue;
        case 20:
          if (tag !== 162) {
            break;
          }

          message.jog = Command_Jog.decode(reader, reader.uint32());
          continue;
        case 21:
          if (tag !== 170) {
            break;
          }

          message.saveTeachpoints = Command_SaveTeachpoints.decode(reader, reader.uint32());
          continue;
        case 22:
          if (tag !== 178) {
            break;
          }

          message.raw_command = Command_RawCommand.decode(reader, reader.uint32());
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
      grasp_plate: isSet(object.grasp_plate) ? Command_GraspPlate.fromJSON(object.grasp_plate) : undefined,
      release_plate: isSet(object.release_plate) ? Command_ReleasePlate.fromJSON(object.release_plate) : undefined,
      approach: isSet(object.approach) ? Command_Approach.fromJSON(object.approach) : undefined,
      leave: isSet(object.leave) ? Command_Leave.fromJSON(object.leave) : undefined,
      transfer: isSet(object.transfer) ? Command_Transfer.fromJSON(object.transfer) : undefined,
      register_motion_profile: isSet(object.register_motion_profile)
        ? Command_RegisterMotionProfile.fromJSON(object.register_motion_profile)
        : undefined,
      smart_transfer: isSet(object.smart_transfer) ? Command_SmartTransfer.fromJSON(object.smart_transfer) : undefined,
      wait: isSet(object.wait) ? Command_Wait.fromJSON(object.wait) : undefined,
      free: isSet(object.free) ? Command_Free.fromJSON(object.free) : undefined,
      unfree: isSet(object.unfree) ? Command_UnFree.fromJSON(object.unfree) : undefined,
      unwind: isSet(object.unwind) ? Command_Unwind.fromJSON(object.unwind) : undefined,
      run_sequence: isSet(object.run_sequence) ? Command_RunSequence.fromJSON(object.run_sequence) : undefined,
      retrieve_plate: isSet(object.retrieve_plate) ? Command_RetrievePlate.fromJSON(object.retrieve_plate) : undefined,
      dropoff_plate: isSet(object.dropoff_plate) ? Command_DropOffPlate.fromJSON(object.dropoff_plate) : undefined,
      pick_lid: isSet(object.pick_lid) ? Command_PickLid.fromJSON(object.pick_lid) : undefined,
      place_lid: isSet(object.place_lid) ? Command_PlaceLid.fromJSON(object.place_lid) : undefined,
      get_teachpoints: isSet(object.get_teachpoints)
        ? Command_GetTeachpoints.fromJSON(object.get_teachpoints)
        : undefined,
      get_current_location: isSet(object.get_current_location)
        ? Command_GetCurrentLocation.fromJSON(object.get_current_location)
        : undefined,
      jog: isSet(object.jog) ? Command_Jog.fromJSON(object.jog) : undefined,
      saveTeachpoints: isSet(object.saveTeachpoints)
        ? Command_SaveTeachpoints.fromJSON(object.saveTeachpoints)
        : undefined,
      raw_command: isSet(object.raw_command) ? Command_RawCommand.fromJSON(object.raw_command) : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.move !== undefined && (obj.move = message.move ? Command_Move.toJSON(message.move) : undefined);
    message.grasp_plate !== undefined &&
      (obj.grasp_plate = message.grasp_plate ? Command_GraspPlate.toJSON(message.grasp_plate) : undefined);
    message.release_plate !== undefined &&
      (obj.release_plate = message.release_plate ? Command_ReleasePlate.toJSON(message.release_plate) : undefined);
    message.approach !== undefined &&
      (obj.approach = message.approach ? Command_Approach.toJSON(message.approach) : undefined);
    message.leave !== undefined && (obj.leave = message.leave ? Command_Leave.toJSON(message.leave) : undefined);
    message.transfer !== undefined &&
      (obj.transfer = message.transfer ? Command_Transfer.toJSON(message.transfer) : undefined);
    message.register_motion_profile !== undefined && (obj.register_motion_profile = message.register_motion_profile
      ? Command_RegisterMotionProfile.toJSON(message.register_motion_profile)
      : undefined);
    message.smart_transfer !== undefined &&
      (obj.smart_transfer = message.smart_transfer ? Command_SmartTransfer.toJSON(message.smart_transfer) : undefined);
    message.wait !== undefined && (obj.wait = message.wait ? Command_Wait.toJSON(message.wait) : undefined);
    message.free !== undefined && (obj.free = message.free ? Command_Free.toJSON(message.free) : undefined);
    message.unfree !== undefined && (obj.unfree = message.unfree ? Command_UnFree.toJSON(message.unfree) : undefined);
    message.unwind !== undefined && (obj.unwind = message.unwind ? Command_Unwind.toJSON(message.unwind) : undefined);
    message.run_sequence !== undefined &&
      (obj.run_sequence = message.run_sequence ? Command_RunSequence.toJSON(message.run_sequence) : undefined);
    message.retrieve_plate !== undefined &&
      (obj.retrieve_plate = message.retrieve_plate ? Command_RetrievePlate.toJSON(message.retrieve_plate) : undefined);
    message.dropoff_plate !== undefined &&
      (obj.dropoff_plate = message.dropoff_plate ? Command_DropOffPlate.toJSON(message.dropoff_plate) : undefined);
    message.pick_lid !== undefined &&
      (obj.pick_lid = message.pick_lid ? Command_PickLid.toJSON(message.pick_lid) : undefined);
    message.place_lid !== undefined &&
      (obj.place_lid = message.place_lid ? Command_PlaceLid.toJSON(message.place_lid) : undefined);
    message.get_teachpoints !== undefined && (obj.get_teachpoints = message.get_teachpoints
      ? Command_GetTeachpoints.toJSON(message.get_teachpoints)
      : undefined);
    message.get_current_location !== undefined && (obj.get_current_location = message.get_current_location
      ? Command_GetCurrentLocation.toJSON(message.get_current_location)
      : undefined);
    message.jog !== undefined && (obj.jog = message.jog ? Command_Jog.toJSON(message.jog) : undefined);
    message.saveTeachpoints !== undefined && (obj.saveTeachpoints = message.saveTeachpoints
      ? Command_SaveTeachpoints.toJSON(message.saveTeachpoints)
      : undefined);
    message.raw_command !== undefined &&
      (obj.raw_command = message.raw_command ? Command_RawCommand.toJSON(message.raw_command) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.move = (object.move !== undefined && object.move !== null)
      ? Command_Move.fromPartial(object.move)
      : undefined;
    message.grasp_plate = (object.grasp_plate !== undefined && object.grasp_plate !== null)
      ? Command_GraspPlate.fromPartial(object.grasp_plate)
      : undefined;
    message.release_plate = (object.release_plate !== undefined && object.release_plate !== null)
      ? Command_ReleasePlate.fromPartial(object.release_plate)
      : undefined;
    message.approach = (object.approach !== undefined && object.approach !== null)
      ? Command_Approach.fromPartial(object.approach)
      : undefined;
    message.leave = (object.leave !== undefined && object.leave !== null)
      ? Command_Leave.fromPartial(object.leave)
      : undefined;
    message.transfer = (object.transfer !== undefined && object.transfer !== null)
      ? Command_Transfer.fromPartial(object.transfer)
      : undefined;
    message.register_motion_profile =
      (object.register_motion_profile !== undefined && object.register_motion_profile !== null)
        ? Command_RegisterMotionProfile.fromPartial(object.register_motion_profile)
        : undefined;
    message.smart_transfer = (object.smart_transfer !== undefined && object.smart_transfer !== null)
      ? Command_SmartTransfer.fromPartial(object.smart_transfer)
      : undefined;
    message.wait = (object.wait !== undefined && object.wait !== null)
      ? Command_Wait.fromPartial(object.wait)
      : undefined;
    message.free = (object.free !== undefined && object.free !== null)
      ? Command_Free.fromPartial(object.free)
      : undefined;
    message.unfree = (object.unfree !== undefined && object.unfree !== null)
      ? Command_UnFree.fromPartial(object.unfree)
      : undefined;
    message.unwind = (object.unwind !== undefined && object.unwind !== null)
      ? Command_Unwind.fromPartial(object.unwind)
      : undefined;
    message.run_sequence = (object.run_sequence !== undefined && object.run_sequence !== null)
      ? Command_RunSequence.fromPartial(object.run_sequence)
      : undefined;
    message.retrieve_plate = (object.retrieve_plate !== undefined && object.retrieve_plate !== null)
      ? Command_RetrievePlate.fromPartial(object.retrieve_plate)
      : undefined;
    message.dropoff_plate = (object.dropoff_plate !== undefined && object.dropoff_plate !== null)
      ? Command_DropOffPlate.fromPartial(object.dropoff_plate)
      : undefined;
    message.pick_lid = (object.pick_lid !== undefined && object.pick_lid !== null)
      ? Command_PickLid.fromPartial(object.pick_lid)
      : undefined;
    message.place_lid = (object.place_lid !== undefined && object.place_lid !== null)
      ? Command_PlaceLid.fromPartial(object.place_lid)
      : undefined;
    message.get_teachpoints = (object.get_teachpoints !== undefined && object.get_teachpoints !== null)
      ? Command_GetTeachpoints.fromPartial(object.get_teachpoints)
      : undefined;
    message.get_current_location = (object.get_current_location !== undefined && object.get_current_location !== null)
      ? Command_GetCurrentLocation.fromPartial(object.get_current_location)
      : undefined;
    message.jog = (object.jog !== undefined && object.jog !== null) ? Command_Jog.fromPartial(object.jog) : undefined;
    message.saveTeachpoints = (object.saveTeachpoints !== undefined && object.saveTeachpoints !== null)
      ? Command_SaveTeachpoints.fromPartial(object.saveTeachpoints)
      : undefined;
    message.raw_command = (object.raw_command !== undefined && object.raw_command !== null)
      ? Command_RawCommand.fromPartial(object.raw_command)
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

  create<I extends Exact<DeepPartial<Command_GetCurrentLocation>, I>>(base?: I): Command_GetCurrentLocation {
    return Command_GetCurrentLocation.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetCurrentLocation>, I>>(_: I): Command_GetCurrentLocation {
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

function createBaseCommand_SaveTeachpoints(): Command_SaveTeachpoints {
  return {};
}

export const Command_SaveTeachpoints = {
  encode(_: Command_SaveTeachpoints, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SaveTeachpoints {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SaveTeachpoints();
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

  fromJSON(_: any): Command_SaveTeachpoints {
    return {};
  },

  toJSON(_: Command_SaveTeachpoints): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SaveTeachpoints>, I>>(base?: I): Command_SaveTeachpoints {
    return Command_SaveTeachpoints.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SaveTeachpoints>, I>>(_: I): Command_SaveTeachpoints {
    const message = createBaseCommand_SaveTeachpoints();
    return message;
  },
};

function createBaseCommand_GetTeachpoints(): Command_GetTeachpoints {
  return {};
}

export const Command_GetTeachpoints = {
  encode(_: Command_GetTeachpoints, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetTeachpoints {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetTeachpoints();
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

  fromJSON(_: any): Command_GetTeachpoints {
    return {};
  },

  toJSON(_: Command_GetTeachpoints): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetTeachpoints>, I>>(base?: I): Command_GetTeachpoints {
    return Command_GetTeachpoints.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetTeachpoints>, I>>(_: I): Command_GetTeachpoints {
    const message = createBaseCommand_GetTeachpoints();
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
      motion_profile_id: isSet(object.motion_profile_id) ? Number(object.motion_profile_id) : undefined,
      pick_from_plate: isSet(object.pick_from_plate) ? Boolean(object.pick_from_plate) : undefined,
    };
  },

  toJSON(message: Command_PickLid): unknown {
    const obj: any = {};
    message.labware !== undefined && (obj.labware = message.labware);
    message.location !== undefined && (obj.location = message.location);
    message.motion_profile_id !== undefined && (obj.motion_profile_id = Math.round(message.motion_profile_id));
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
      motion_profile_id: isSet(object.motion_profile_id) ? Number(object.motion_profile_id) : undefined,
      place_on_plate: isSet(object.place_on_plate) ? Boolean(object.place_on_plate) : undefined,
    };
  },

  toJSON(message: Command_PlaceLid): unknown {
    const obj: any = {};
    message.labware !== undefined && (obj.labware = message.labware);
    message.location !== undefined && (obj.location = message.location);
    message.motion_profile_id !== undefined && (obj.motion_profile_id = Math.round(message.motion_profile_id));
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
  return { labware: "", location: "", motion_profile_id: undefined };
}

export const Command_RetrievePlate = {
  encode(message: Command_RetrievePlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.labware !== "") {
      writer.uint32(10).string(message.labware);
    }
    if (message.location !== "") {
      writer.uint32(18).string(message.location);
    }
    if (message.motion_profile_id !== undefined) {
      writer.uint32(24).int32(message.motion_profile_id);
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
          if (tag !== 24) {
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
      motion_profile_id: isSet(object.motion_profile_id) ? Number(object.motion_profile_id) : undefined,
    };
  },

  toJSON(message: Command_RetrievePlate): unknown {
    const obj: any = {};
    message.labware !== undefined && (obj.labware = message.labware);
    message.location !== undefined && (obj.location = message.location);
    message.motion_profile_id !== undefined && (obj.motion_profile_id = Math.round(message.motion_profile_id));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RetrievePlate>, I>>(base?: I): Command_RetrievePlate {
    return Command_RetrievePlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RetrievePlate>, I>>(object: I): Command_RetrievePlate {
    const message = createBaseCommand_RetrievePlate();
    message.labware = object.labware ?? "";
    message.location = object.location ?? "";
    message.motion_profile_id = object.motion_profile_id ?? undefined;
    return message;
  },
};

function createBaseCommand_DropOffPlate(): Command_DropOffPlate {
  return { labware: "", location: "", motion_profile_id: undefined };
}

export const Command_DropOffPlate = {
  encode(message: Command_DropOffPlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.labware !== "") {
      writer.uint32(10).string(message.labware);
    }
    if (message.location !== "") {
      writer.uint32(18).string(message.location);
    }
    if (message.motion_profile_id !== undefined) {
      writer.uint32(24).int32(message.motion_profile_id);
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
          if (tag !== 24) {
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
      motion_profile_id: isSet(object.motion_profile_id) ? Number(object.motion_profile_id) : undefined,
    };
  },

  toJSON(message: Command_DropOffPlate): unknown {
    const obj: any = {};
    message.labware !== undefined && (obj.labware = message.labware);
    message.location !== undefined && (obj.location = message.location);
    message.motion_profile_id !== undefined && (obj.motion_profile_id = Math.round(message.motion_profile_id));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_DropOffPlate>, I>>(base?: I): Command_DropOffPlate {
    return Command_DropOffPlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_DropOffPlate>, I>>(object: I): Command_DropOffPlate {
    const message = createBaseCommand_DropOffPlate();
    message.labware = object.labware ?? "";
    message.location = object.location ?? "";
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

  fromPartial<I extends Exact<DeepPartial<Command_RunSequence>, I>>(object: I): Command_RunSequence {
    const message = createBaseCommand_RunSequence();
    message.sequence_name = object.sequence_name ?? "";
    message.labware = object.labware ?? "";
    return message;
  },
};

function createBaseCommand_UnFree(): Command_UnFree {
  return {};
}

export const Command_UnFree = {
  encode(_: Command_UnFree, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_UnFree {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_UnFree();
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

  fromJSON(_: any): Command_UnFree {
    return {};
  },

  toJSON(_: Command_UnFree): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_UnFree>, I>>(base?: I): Command_UnFree {
    return Command_UnFree.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_UnFree>, I>>(_: I): Command_UnFree {
    const message = createBaseCommand_UnFree();
    return message;
  },
};

function createBaseCommand_Free(): Command_Free {
  return {};
}

export const Command_Free = {
  encode(_: Command_Free, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Free {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Free();
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

  fromJSON(_: any): Command_Free {
    return {};
  },

  toJSON(_: Command_Free): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Free>, I>>(base?: I): Command_Free {
    return Command_Free.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Free>, I>>(_: I): Command_Free {
    const message = createBaseCommand_Free();
    return message;
  },
};

function createBaseCommand_Unwind(): Command_Unwind {
  return {};
}

export const Command_Unwind = {
  encode(_: Command_Unwind, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Unwind {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Unwind();
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

  fromJSON(_: any): Command_Unwind {
    return {};
  },

  toJSON(_: Command_Unwind): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Unwind>, I>>(base?: I): Command_Unwind {
    return Command_Unwind.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Unwind>, I>>(_: I): Command_Unwind {
    const message = createBaseCommand_Unwind();
    return message;
  },
};

function createBaseCommand_Move(): Command_Move {
  return { waypoint: "", motion_profile_id: undefined };
}

export const Command_Move = {
  encode(message: Command_Move, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.waypoint !== "") {
      writer.uint32(10).string(message.waypoint);
    }
    if (message.motion_profile_id !== undefined) {
      writer.uint32(16).int32(message.motion_profile_id);
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

          message.waypoint = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
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

  fromJSON(object: any): Command_Move {
    return {
      waypoint: isSet(object.waypoint) ? String(object.waypoint) : "",
      motion_profile_id: isSet(object.motion_profile_id) ? Number(object.motion_profile_id) : undefined,
    };
  },

  toJSON(message: Command_Move): unknown {
    const obj: any = {};
    message.waypoint !== undefined && (obj.waypoint = message.waypoint);
    message.motion_profile_id !== undefined && (obj.motion_profile_id = Math.round(message.motion_profile_id));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Move>, I>>(base?: I): Command_Move {
    return Command_Move.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Move>, I>>(object: I): Command_Move {
    const message = createBaseCommand_Move();
    message.waypoint = object.waypoint ?? "";
    message.motion_profile_id = object.motion_profile_id ?? undefined;
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

  fromPartial<I extends Exact<DeepPartial<Command_ReleasePlate>, I>>(object: I): Command_ReleasePlate {
    const message = createBaseCommand_ReleasePlate();
    message.width = object.width ?? 0;
    message.speed = object.speed ?? 0;
    return message;
  },
};

function createBaseCommand_Approach(): Command_Approach {
  return {
    nest: "",
    x_offset: undefined,
    y_offset: undefined,
    z_offset: undefined,
    motion_profile_id: undefined,
    ignore_safepath: undefined,
  };
}

export const Command_Approach = {
  encode(message: Command_Approach, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.nest !== "") {
      writer.uint32(10).string(message.nest);
    }
    if (message.x_offset !== undefined) {
      writer.uint32(21).float(message.x_offset);
    }
    if (message.y_offset !== undefined) {
      writer.uint32(29).float(message.y_offset);
    }
    if (message.z_offset !== undefined) {
      writer.uint32(37).float(message.z_offset);
    }
    if (message.motion_profile_id !== undefined) {
      writer.uint32(40).int32(message.motion_profile_id);
    }
    if (message.ignore_safepath !== undefined) {
      writer.uint32(50).string(message.ignore_safepath);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Approach {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Approach();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.nest = reader.string();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.x_offset = reader.float();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.y_offset = reader.float();
          continue;
        case 4:
          if (tag !== 37) {
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
        case 6:
          if (tag !== 50) {
            break;
          }

          message.ignore_safepath = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Approach {
    return {
      nest: isSet(object.nest) ? String(object.nest) : "",
      x_offset: isSet(object.x_offset) ? Number(object.x_offset) : undefined,
      y_offset: isSet(object.y_offset) ? Number(object.y_offset) : undefined,
      z_offset: isSet(object.z_offset) ? Number(object.z_offset) : undefined,
      motion_profile_id: isSet(object.motion_profile_id) ? Number(object.motion_profile_id) : undefined,
      ignore_safepath: isSet(object.ignore_safepath) ? String(object.ignore_safepath) : undefined,
    };
  },

  toJSON(message: Command_Approach): unknown {
    const obj: any = {};
    message.nest !== undefined && (obj.nest = message.nest);
    message.x_offset !== undefined && (obj.x_offset = message.x_offset);
    message.y_offset !== undefined && (obj.y_offset = message.y_offset);
    message.z_offset !== undefined && (obj.z_offset = message.z_offset);
    message.motion_profile_id !== undefined && (obj.motion_profile_id = Math.round(message.motion_profile_id));
    message.ignore_safepath !== undefined && (obj.ignore_safepath = message.ignore_safepath);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Approach>, I>>(base?: I): Command_Approach {
    return Command_Approach.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Approach>, I>>(object: I): Command_Approach {
    const message = createBaseCommand_Approach();
    message.nest = object.nest ?? "";
    message.x_offset = object.x_offset ?? undefined;
    message.y_offset = object.y_offset ?? undefined;
    message.z_offset = object.z_offset ?? undefined;
    message.motion_profile_id = object.motion_profile_id ?? undefined;
    message.ignore_safepath = object.ignore_safepath ?? undefined;
    return message;
  },
};

function createBaseCommand_Leave(): Command_Leave {
  return { nest: "", x_offset: undefined, y_offset: undefined, z_offset: undefined, motion_profile_id: undefined };
}

export const Command_Leave = {
  encode(message: Command_Leave, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.nest !== "") {
      writer.uint32(10).string(message.nest);
    }
    if (message.x_offset !== undefined) {
      writer.uint32(21).float(message.x_offset);
    }
    if (message.y_offset !== undefined) {
      writer.uint32(29).float(message.y_offset);
    }
    if (message.z_offset !== undefined) {
      writer.uint32(37).float(message.z_offset);
    }
    if (message.motion_profile_id !== undefined) {
      writer.uint32(40).int32(message.motion_profile_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Leave {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Leave();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.nest = reader.string();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.x_offset = reader.float();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.y_offset = reader.float();
          continue;
        case 4:
          if (tag !== 37) {
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

  fromJSON(object: any): Command_Leave {
    return {
      nest: isSet(object.nest) ? String(object.nest) : "",
      x_offset: isSet(object.x_offset) ? Number(object.x_offset) : undefined,
      y_offset: isSet(object.y_offset) ? Number(object.y_offset) : undefined,
      z_offset: isSet(object.z_offset) ? Number(object.z_offset) : undefined,
      motion_profile_id: isSet(object.motion_profile_id) ? Number(object.motion_profile_id) : undefined,
    };
  },

  toJSON(message: Command_Leave): unknown {
    const obj: any = {};
    message.nest !== undefined && (obj.nest = message.nest);
    message.x_offset !== undefined && (obj.x_offset = message.x_offset);
    message.y_offset !== undefined && (obj.y_offset = message.y_offset);
    message.z_offset !== undefined && (obj.z_offset = message.z_offset);
    message.motion_profile_id !== undefined && (obj.motion_profile_id = Math.round(message.motion_profile_id));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Leave>, I>>(base?: I): Command_Leave {
    return Command_Leave.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Leave>, I>>(object: I): Command_Leave {
    const message = createBaseCommand_Leave();
    message.nest = object.nest ?? "";
    message.x_offset = object.x_offset ?? undefined;
    message.y_offset = object.y_offset ?? undefined;
    message.z_offset = object.z_offset ?? undefined;
    message.motion_profile_id = object.motion_profile_id ?? undefined;
    return message;
  },
};

function createBaseCommand_Transfer(): Command_Transfer {
  return {
    source_nest: undefined,
    destination_nest: undefined,
    grasp_params: undefined,
    release_params: undefined,
    motion_profile_id: undefined,
    grip_width: undefined,
  };
}

export const Command_Transfer = {
  encode(message: Command_Transfer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.source_nest !== undefined) {
      Command_Approach.encode(message.source_nest, writer.uint32(10).fork()).ldelim();
    }
    if (message.destination_nest !== undefined) {
      Command_Leave.encode(message.destination_nest, writer.uint32(18).fork()).ldelim();
    }
    if (message.grasp_params !== undefined) {
      Command_GraspPlate.encode(message.grasp_params, writer.uint32(26).fork()).ldelim();
    }
    if (message.release_params !== undefined) {
      Command_ReleasePlate.encode(message.release_params, writer.uint32(34).fork()).ldelim();
    }
    if (message.motion_profile_id !== undefined) {
      writer.uint32(40).int32(message.motion_profile_id);
    }
    if (message.grip_width !== undefined) {
      writer.uint32(48).int32(message.grip_width);
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

          message.source_nest = Command_Approach.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.destination_nest = Command_Leave.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.grasp_params = Command_GraspPlate.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.release_params = Command_ReleasePlate.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.motion_profile_id = reader.int32();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.grip_width = reader.int32();
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
      source_nest: isSet(object.source_nest) ? Command_Approach.fromJSON(object.source_nest) : undefined,
      destination_nest: isSet(object.destination_nest) ? Command_Leave.fromJSON(object.destination_nest) : undefined,
      grasp_params: isSet(object.grasp_params) ? Command_GraspPlate.fromJSON(object.grasp_params) : undefined,
      release_params: isSet(object.release_params) ? Command_ReleasePlate.fromJSON(object.release_params) : undefined,
      motion_profile_id: isSet(object.motion_profile_id) ? Number(object.motion_profile_id) : undefined,
      grip_width: isSet(object.grip_width) ? Number(object.grip_width) : undefined,
    };
  },

  toJSON(message: Command_Transfer): unknown {
    const obj: any = {};
    message.source_nest !== undefined &&
      (obj.source_nest = message.source_nest ? Command_Approach.toJSON(message.source_nest) : undefined);
    message.destination_nest !== undefined &&
      (obj.destination_nest = message.destination_nest ? Command_Leave.toJSON(message.destination_nest) : undefined);
    message.grasp_params !== undefined &&
      (obj.grasp_params = message.grasp_params ? Command_GraspPlate.toJSON(message.grasp_params) : undefined);
    message.release_params !== undefined &&
      (obj.release_params = message.release_params ? Command_ReleasePlate.toJSON(message.release_params) : undefined);
    message.motion_profile_id !== undefined && (obj.motion_profile_id = Math.round(message.motion_profile_id));
    message.grip_width !== undefined && (obj.grip_width = Math.round(message.grip_width));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Transfer>, I>>(base?: I): Command_Transfer {
    return Command_Transfer.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Transfer>, I>>(object: I): Command_Transfer {
    const message = createBaseCommand_Transfer();
    message.source_nest = (object.source_nest !== undefined && object.source_nest !== null)
      ? Command_Approach.fromPartial(object.source_nest)
      : undefined;
    message.destination_nest = (object.destination_nest !== undefined && object.destination_nest !== null)
      ? Command_Leave.fromPartial(object.destination_nest)
      : undefined;
    message.grasp_params = (object.grasp_params !== undefined && object.grasp_params !== null)
      ? Command_GraspPlate.fromPartial(object.grasp_params)
      : undefined;
    message.release_params = (object.release_params !== undefined && object.release_params !== null)
      ? Command_ReleasePlate.fromPartial(object.release_params)
      : undefined;
    message.motion_profile_id = object.motion_profile_id ?? undefined;
    message.grip_width = object.grip_width ?? undefined;
    return message;
  },
};

function createBaseCommand_RegisterMotionProfile(): Command_RegisterMotionProfile {
  return { id: 0, speed: 0, speed2: 0, accel: 0, decel: 0, accel_ramp: 0, decel_ramp: 0, inrange: 0, straight: 0 };
}

export const Command_RegisterMotionProfile = {
  encode(message: Command_RegisterMotionProfile, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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

  create<I extends Exact<DeepPartial<Command_RegisterMotionProfile>, I>>(base?: I): Command_RegisterMotionProfile {
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

function createBaseCommand_SmartTransfer(): Command_SmartTransfer {
  return {
    source_nest: undefined,
    destination_nest: undefined,
    grasp_params: undefined,
    release_params: undefined,
    motion_profile_id: undefined,
    grip_width: undefined,
  };
}

export const Command_SmartTransfer = {
  encode(message: Command_SmartTransfer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.source_nest !== undefined) {
      Command_Approach.encode(message.source_nest, writer.uint32(10).fork()).ldelim();
    }
    if (message.destination_nest !== undefined) {
      Command_Leave.encode(message.destination_nest, writer.uint32(18).fork()).ldelim();
    }
    if (message.grasp_params !== undefined) {
      Command_GraspPlate.encode(message.grasp_params, writer.uint32(26).fork()).ldelim();
    }
    if (message.release_params !== undefined) {
      Command_ReleasePlate.encode(message.release_params, writer.uint32(34).fork()).ldelim();
    }
    if (message.motion_profile_id !== undefined) {
      writer.uint32(40).int32(message.motion_profile_id);
    }
    if (message.grip_width !== undefined) {
      writer.uint32(48).int32(message.grip_width);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SmartTransfer {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SmartTransfer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.source_nest = Command_Approach.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.destination_nest = Command_Leave.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.grasp_params = Command_GraspPlate.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.release_params = Command_ReleasePlate.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.motion_profile_id = reader.int32();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.grip_width = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_SmartTransfer {
    return {
      source_nest: isSet(object.source_nest) ? Command_Approach.fromJSON(object.source_nest) : undefined,
      destination_nest: isSet(object.destination_nest) ? Command_Leave.fromJSON(object.destination_nest) : undefined,
      grasp_params: isSet(object.grasp_params) ? Command_GraspPlate.fromJSON(object.grasp_params) : undefined,
      release_params: isSet(object.release_params) ? Command_ReleasePlate.fromJSON(object.release_params) : undefined,
      motion_profile_id: isSet(object.motion_profile_id) ? Number(object.motion_profile_id) : undefined,
      grip_width: isSet(object.grip_width) ? Number(object.grip_width) : undefined,
    };
  },

  toJSON(message: Command_SmartTransfer): unknown {
    const obj: any = {};
    message.source_nest !== undefined &&
      (obj.source_nest = message.source_nest ? Command_Approach.toJSON(message.source_nest) : undefined);
    message.destination_nest !== undefined &&
      (obj.destination_nest = message.destination_nest ? Command_Leave.toJSON(message.destination_nest) : undefined);
    message.grasp_params !== undefined &&
      (obj.grasp_params = message.grasp_params ? Command_GraspPlate.toJSON(message.grasp_params) : undefined);
    message.release_params !== undefined &&
      (obj.release_params = message.release_params ? Command_ReleasePlate.toJSON(message.release_params) : undefined);
    message.motion_profile_id !== undefined && (obj.motion_profile_id = Math.round(message.motion_profile_id));
    message.grip_width !== undefined && (obj.grip_width = Math.round(message.grip_width));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SmartTransfer>, I>>(base?: I): Command_SmartTransfer {
    return Command_SmartTransfer.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SmartTransfer>, I>>(object: I): Command_SmartTransfer {
    const message = createBaseCommand_SmartTransfer();
    message.source_nest = (object.source_nest !== undefined && object.source_nest !== null)
      ? Command_Approach.fromPartial(object.source_nest)
      : undefined;
    message.destination_nest = (object.destination_nest !== undefined && object.destination_nest !== null)
      ? Command_Leave.fromPartial(object.destination_nest)
      : undefined;
    message.grasp_params = (object.grasp_params !== undefined && object.grasp_params !== null)
      ? Command_GraspPlate.fromPartial(object.grasp_params)
      : undefined;
    message.release_params = (object.release_params !== undefined && object.release_params !== null)
      ? Command_ReleasePlate.fromPartial(object.release_params)
      : undefined;
    message.motion_profile_id = object.motion_profile_id ?? undefined;
    message.grip_width = object.grip_width ?? undefined;
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

function createBaseConfig(): Config {
  return { host: "", port: 0, location: Config_Location.UNKNOWN_WORKCELL, tool_id: "", joints: 0 };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.port !== 0) {
      writer.uint32(16).int32(message.port);
    }
    if (message.location !== Config_Location.UNKNOWN_WORKCELL) {
      writer.uint32(24).int32(config_LocationToNumber(message.location));
    }
    if (message.tool_id !== "") {
      writer.uint32(34).string(message.tool_id);
    }
    if (message.joints !== 0) {
      writer.uint32(40).int32(message.joints);
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

          message.location = config_LocationFromJSON(reader.int32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.tool_id = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
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
      location: isSet(object.location) ? config_LocationFromJSON(object.location) : Config_Location.UNKNOWN_WORKCELL,
      tool_id: isSet(object.tool_id) ? String(object.tool_id) : "",
      joints: isSet(object.joints) ? Number(object.joints) : 0,
    };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.host !== undefined && (obj.host = message.host);
    message.port !== undefined && (obj.port = Math.round(message.port));
    message.location !== undefined && (obj.location = config_LocationToJSON(message.location));
    message.tool_id !== undefined && (obj.tool_id = message.tool_id);
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
    message.location = object.location ?? Config_Location.UNKNOWN_WORKCELL;
    message.tool_id = object.tool_id ?? "";
    message.joints = object.joints ?? 0;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
