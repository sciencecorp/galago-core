/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.vspin_with_loader";

export interface Command {
  home?: Command_Home | undefined;
  close_door?: Command_CloseDoor | undefined;
  open_door?: Command_OpenDoor | undefined;
  load_plate?: Command_LoadPlate | undefined;
  unload_plate?: Command_UnloadPlate | undefined;
  park?: Command_Park | undefined;
  spin_cycle?: Command_Spin | undefined;
  stop_spin_cycle?: Command_StopSpin | undefined;
  show_diagnostics?: Command_ShowDiagsDialog | undefined;
}

export interface Command_Home {
}

export interface Command_CloseDoor {
}

export interface Command_OpenDoor {
  /** 1 or 2 */
  bucket: number;
}

export interface Command_LoadPlate {
  /** 1 or 2 */
  bucket: number;
  /** 2.6 to 21.1 */
  gripper_offset: number;
  /** 0.0 to 48.0 */
  plate_height: number;
  /** 0 (slow) to 3 (fast) */
  speed: string;
  /** 0-7 bitfield options */
  options: number;
}

export interface Command_UnloadPlate {
  /** 1 or 2 */
  bucket: number;
  /** 2.6 to 21.1 */
  gripper_offset: number;
  /** 0.0 to 48.0 */
  plate_height: number;
  /** 0 (slow) to 3 (fast) */
  speed: string;
  /** 0-7 bitfield options */
  options: number;
}

export interface Command_Park {
}

export interface Command_Spin {
  bucket: number;
  time: number;
  velocity_percent: number;
  acceleration_percent: number;
  deceleration_percent: number;
  /** 0 is total time, 1 is time at speed */
  timer_mode: number;
}

/** Stop current spin cycle and present bucket */
export interface Command_StopSpin {
  /** 1 or 2 */
  bucket: number;
}

export interface Command_ShowDiagsDialog {
}

export interface Config {
  profile: string;
}

function createBaseCommand(): Command {
  return {
    home: undefined,
    close_door: undefined,
    open_door: undefined,
    load_plate: undefined,
    unload_plate: undefined,
    park: undefined,
    spin_cycle: undefined,
    stop_spin_cycle: undefined,
    show_diagnostics: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.home !== undefined) {
      Command_Home.encode(message.home, writer.uint32(10).fork()).ldelim();
    }
    if (message.close_door !== undefined) {
      Command_CloseDoor.encode(message.close_door, writer.uint32(18).fork()).ldelim();
    }
    if (message.open_door !== undefined) {
      Command_OpenDoor.encode(message.open_door, writer.uint32(26).fork()).ldelim();
    }
    if (message.load_plate !== undefined) {
      Command_LoadPlate.encode(message.load_plate, writer.uint32(34).fork()).ldelim();
    }
    if (message.unload_plate !== undefined) {
      Command_UnloadPlate.encode(message.unload_plate, writer.uint32(42).fork()).ldelim();
    }
    if (message.park !== undefined) {
      Command_Park.encode(message.park, writer.uint32(50).fork()).ldelim();
    }
    if (message.spin_cycle !== undefined) {
      Command_Spin.encode(message.spin_cycle, writer.uint32(58).fork()).ldelim();
    }
    if (message.stop_spin_cycle !== undefined) {
      Command_StopSpin.encode(message.stop_spin_cycle, writer.uint32(66).fork()).ldelim();
    }
    if (message.show_diagnostics !== undefined) {
      Command_ShowDiagsDialog.encode(message.show_diagnostics, writer.uint32(74).fork()).ldelim();
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

          message.home = Command_Home.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.close_door = Command_CloseDoor.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.open_door = Command_OpenDoor.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.load_plate = Command_LoadPlate.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.unload_plate = Command_UnloadPlate.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.park = Command_Park.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.spin_cycle = Command_Spin.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.stop_spin_cycle = Command_StopSpin.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.show_diagnostics = Command_ShowDiagsDialog.decode(reader, reader.uint32());
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
      home: isSet(object.home) ? Command_Home.fromJSON(object.home) : undefined,
      close_door: isSet(object.close_door) ? Command_CloseDoor.fromJSON(object.close_door) : undefined,
      open_door: isSet(object.open_door) ? Command_OpenDoor.fromJSON(object.open_door) : undefined,
      load_plate: isSet(object.load_plate) ? Command_LoadPlate.fromJSON(object.load_plate) : undefined,
      unload_plate: isSet(object.unload_plate) ? Command_UnloadPlate.fromJSON(object.unload_plate) : undefined,
      park: isSet(object.park) ? Command_Park.fromJSON(object.park) : undefined,
      spin_cycle: isSet(object.spin_cycle) ? Command_Spin.fromJSON(object.spin_cycle) : undefined,
      stop_spin_cycle: isSet(object.stop_spin_cycle) ? Command_StopSpin.fromJSON(object.stop_spin_cycle) : undefined,
      show_diagnostics: isSet(object.show_diagnostics)
        ? Command_ShowDiagsDialog.fromJSON(object.show_diagnostics)
        : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.home !== undefined && (obj.home = message.home ? Command_Home.toJSON(message.home) : undefined);
    message.close_door !== undefined &&
      (obj.close_door = message.close_door ? Command_CloseDoor.toJSON(message.close_door) : undefined);
    message.open_door !== undefined &&
      (obj.open_door = message.open_door ? Command_OpenDoor.toJSON(message.open_door) : undefined);
    message.load_plate !== undefined &&
      (obj.load_plate = message.load_plate ? Command_LoadPlate.toJSON(message.load_plate) : undefined);
    message.unload_plate !== undefined &&
      (obj.unload_plate = message.unload_plate ? Command_UnloadPlate.toJSON(message.unload_plate) : undefined);
    message.park !== undefined && (obj.park = message.park ? Command_Park.toJSON(message.park) : undefined);
    message.spin_cycle !== undefined &&
      (obj.spin_cycle = message.spin_cycle ? Command_Spin.toJSON(message.spin_cycle) : undefined);
    message.stop_spin_cycle !== undefined &&
      (obj.stop_spin_cycle = message.stop_spin_cycle ? Command_StopSpin.toJSON(message.stop_spin_cycle) : undefined);
    message.show_diagnostics !== undefined && (obj.show_diagnostics = message.show_diagnostics
      ? Command_ShowDiagsDialog.toJSON(message.show_diagnostics)
      : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.home = (object.home !== undefined && object.home !== null)
      ? Command_Home.fromPartial(object.home)
      : undefined;
    message.close_door = (object.close_door !== undefined && object.close_door !== null)
      ? Command_CloseDoor.fromPartial(object.close_door)
      : undefined;
    message.open_door = (object.open_door !== undefined && object.open_door !== null)
      ? Command_OpenDoor.fromPartial(object.open_door)
      : undefined;
    message.load_plate = (object.load_plate !== undefined && object.load_plate !== null)
      ? Command_LoadPlate.fromPartial(object.load_plate)
      : undefined;
    message.unload_plate = (object.unload_plate !== undefined && object.unload_plate !== null)
      ? Command_UnloadPlate.fromPartial(object.unload_plate)
      : undefined;
    message.park = (object.park !== undefined && object.park !== null)
      ? Command_Park.fromPartial(object.park)
      : undefined;
    message.spin_cycle = (object.spin_cycle !== undefined && object.spin_cycle !== null)
      ? Command_Spin.fromPartial(object.spin_cycle)
      : undefined;
    message.stop_spin_cycle = (object.stop_spin_cycle !== undefined && object.stop_spin_cycle !== null)
      ? Command_StopSpin.fromPartial(object.stop_spin_cycle)
      : undefined;
    message.show_diagnostics = (object.show_diagnostics !== undefined && object.show_diagnostics !== null)
      ? Command_ShowDiagsDialog.fromPartial(object.show_diagnostics)
      : undefined;
    return message;
  },
};

function createBaseCommand_Home(): Command_Home {
  return {};
}

export const Command_Home = {
  encode(_: Command_Home, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Home {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Home();
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

  fromJSON(_: any): Command_Home {
    return {};
  },

  toJSON(_: Command_Home): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Home>, I>>(base?: I): Command_Home {
    return Command_Home.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Home>, I>>(_: I): Command_Home {
    const message = createBaseCommand_Home();
    return message;
  },
};

function createBaseCommand_CloseDoor(): Command_CloseDoor {
  return {};
}

export const Command_CloseDoor = {
  encode(_: Command_CloseDoor, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_CloseDoor {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_CloseDoor();
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

  fromJSON(_: any): Command_CloseDoor {
    return {};
  },

  toJSON(_: Command_CloseDoor): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_CloseDoor>, I>>(base?: I): Command_CloseDoor {
    return Command_CloseDoor.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_CloseDoor>, I>>(_: I): Command_CloseDoor {
    const message = createBaseCommand_CloseDoor();
    return message;
  },
};

function createBaseCommand_OpenDoor(): Command_OpenDoor {
  return { bucket: 0 };
}

export const Command_OpenDoor = {
  encode(message: Command_OpenDoor, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bucket !== 0) {
      writer.uint32(8).int32(message.bucket);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_OpenDoor {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_OpenDoor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.bucket = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_OpenDoor {
    return { bucket: isSet(object.bucket) ? Number(object.bucket) : 0 };
  },

  toJSON(message: Command_OpenDoor): unknown {
    const obj: any = {};
    message.bucket !== undefined && (obj.bucket = Math.round(message.bucket));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_OpenDoor>, I>>(base?: I): Command_OpenDoor {
    return Command_OpenDoor.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_OpenDoor>, I>>(object: I): Command_OpenDoor {
    const message = createBaseCommand_OpenDoor();
    message.bucket = object.bucket ?? 0;
    return message;
  },
};

function createBaseCommand_LoadPlate(): Command_LoadPlate {
  return { bucket: 0, gripper_offset: 0, plate_height: 0, speed: "", options: 0 };
}

export const Command_LoadPlate = {
  encode(message: Command_LoadPlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bucket !== 0) {
      writer.uint32(8).int32(message.bucket);
    }
    if (message.gripper_offset !== 0) {
      writer.uint32(21).float(message.gripper_offset);
    }
    if (message.plate_height !== 0) {
      writer.uint32(29).float(message.plate_height);
    }
    if (message.speed !== "") {
      writer.uint32(34).string(message.speed);
    }
    if (message.options !== 0) {
      writer.uint32(40).int32(message.options);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_LoadPlate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_LoadPlate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.bucket = reader.int32();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.gripper_offset = reader.float();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.plate_height = reader.float();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.speed = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.options = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_LoadPlate {
    return {
      bucket: isSet(object.bucket) ? Number(object.bucket) : 0,
      gripper_offset: isSet(object.gripper_offset) ? Number(object.gripper_offset) : 0,
      plate_height: isSet(object.plate_height) ? Number(object.plate_height) : 0,
      speed: isSet(object.speed) ? String(object.speed) : "",
      options: isSet(object.options) ? Number(object.options) : 0,
    };
  },

  toJSON(message: Command_LoadPlate): unknown {
    const obj: any = {};
    message.bucket !== undefined && (obj.bucket = Math.round(message.bucket));
    message.gripper_offset !== undefined && (obj.gripper_offset = message.gripper_offset);
    message.plate_height !== undefined && (obj.plate_height = message.plate_height);
    message.speed !== undefined && (obj.speed = message.speed);
    message.options !== undefined && (obj.options = Math.round(message.options));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_LoadPlate>, I>>(base?: I): Command_LoadPlate {
    return Command_LoadPlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_LoadPlate>, I>>(object: I): Command_LoadPlate {
    const message = createBaseCommand_LoadPlate();
    message.bucket = object.bucket ?? 0;
    message.gripper_offset = object.gripper_offset ?? 0;
    message.plate_height = object.plate_height ?? 0;
    message.speed = object.speed ?? "";
    message.options = object.options ?? 0;
    return message;
  },
};

function createBaseCommand_UnloadPlate(): Command_UnloadPlate {
  return { bucket: 0, gripper_offset: 0, plate_height: 0, speed: "", options: 0 };
}

export const Command_UnloadPlate = {
  encode(message: Command_UnloadPlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bucket !== 0) {
      writer.uint32(8).int32(message.bucket);
    }
    if (message.gripper_offset !== 0) {
      writer.uint32(21).float(message.gripper_offset);
    }
    if (message.plate_height !== 0) {
      writer.uint32(29).float(message.plate_height);
    }
    if (message.speed !== "") {
      writer.uint32(34).string(message.speed);
    }
    if (message.options !== 0) {
      writer.uint32(40).int32(message.options);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_UnloadPlate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_UnloadPlate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.bucket = reader.int32();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.gripper_offset = reader.float();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.plate_height = reader.float();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.speed = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.options = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_UnloadPlate {
    return {
      bucket: isSet(object.bucket) ? Number(object.bucket) : 0,
      gripper_offset: isSet(object.gripper_offset) ? Number(object.gripper_offset) : 0,
      plate_height: isSet(object.plate_height) ? Number(object.plate_height) : 0,
      speed: isSet(object.speed) ? String(object.speed) : "",
      options: isSet(object.options) ? Number(object.options) : 0,
    };
  },

  toJSON(message: Command_UnloadPlate): unknown {
    const obj: any = {};
    message.bucket !== undefined && (obj.bucket = Math.round(message.bucket));
    message.gripper_offset !== undefined && (obj.gripper_offset = message.gripper_offset);
    message.plate_height !== undefined && (obj.plate_height = message.plate_height);
    message.speed !== undefined && (obj.speed = message.speed);
    message.options !== undefined && (obj.options = Math.round(message.options));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_UnloadPlate>, I>>(base?: I): Command_UnloadPlate {
    return Command_UnloadPlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_UnloadPlate>, I>>(object: I): Command_UnloadPlate {
    const message = createBaseCommand_UnloadPlate();
    message.bucket = object.bucket ?? 0;
    message.gripper_offset = object.gripper_offset ?? 0;
    message.plate_height = object.plate_height ?? 0;
    message.speed = object.speed ?? "";
    message.options = object.options ?? 0;
    return message;
  },
};

function createBaseCommand_Park(): Command_Park {
  return {};
}

export const Command_Park = {
  encode(_: Command_Park, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Park {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Park();
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

  fromJSON(_: any): Command_Park {
    return {};
  },

  toJSON(_: Command_Park): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Park>, I>>(base?: I): Command_Park {
    return Command_Park.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Park>, I>>(_: I): Command_Park {
    const message = createBaseCommand_Park();
    return message;
  },
};

function createBaseCommand_Spin(): Command_Spin {
  return { bucket: 0, time: 0, velocity_percent: 0, acceleration_percent: 0, deceleration_percent: 0, timer_mode: 0 };
}

export const Command_Spin = {
  encode(message: Command_Spin, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bucket !== 0) {
      writer.uint32(8).int32(message.bucket);
    }
    if (message.time !== 0) {
      writer.uint32(16).int32(message.time);
    }
    if (message.velocity_percent !== 0) {
      writer.uint32(29).float(message.velocity_percent);
    }
    if (message.acceleration_percent !== 0) {
      writer.uint32(37).float(message.acceleration_percent);
    }
    if (message.deceleration_percent !== 0) {
      writer.uint32(45).float(message.deceleration_percent);
    }
    if (message.timer_mode !== 0) {
      writer.uint32(48).int32(message.timer_mode);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Spin {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Spin();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.bucket = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.time = reader.int32();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.velocity_percent = reader.float();
          continue;
        case 4:
          if (tag !== 37) {
            break;
          }

          message.acceleration_percent = reader.float();
          continue;
        case 5:
          if (tag !== 45) {
            break;
          }

          message.deceleration_percent = reader.float();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.timer_mode = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Spin {
    return {
      bucket: isSet(object.bucket) ? Number(object.bucket) : 0,
      time: isSet(object.time) ? Number(object.time) : 0,
      velocity_percent: isSet(object.velocity_percent) ? Number(object.velocity_percent) : 0,
      acceleration_percent: isSet(object.acceleration_percent) ? Number(object.acceleration_percent) : 0,
      deceleration_percent: isSet(object.deceleration_percent) ? Number(object.deceleration_percent) : 0,
      timer_mode: isSet(object.timer_mode) ? Number(object.timer_mode) : 0,
    };
  },

  toJSON(message: Command_Spin): unknown {
    const obj: any = {};
    message.bucket !== undefined && (obj.bucket = Math.round(message.bucket));
    message.time !== undefined && (obj.time = Math.round(message.time));
    message.velocity_percent !== undefined && (obj.velocity_percent = message.velocity_percent);
    message.acceleration_percent !== undefined && (obj.acceleration_percent = message.acceleration_percent);
    message.deceleration_percent !== undefined && (obj.deceleration_percent = message.deceleration_percent);
    message.timer_mode !== undefined && (obj.timer_mode = Math.round(message.timer_mode));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Spin>, I>>(base?: I): Command_Spin {
    return Command_Spin.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Spin>, I>>(object: I): Command_Spin {
    const message = createBaseCommand_Spin();
    message.bucket = object.bucket ?? 0;
    message.time = object.time ?? 0;
    message.velocity_percent = object.velocity_percent ?? 0;
    message.acceleration_percent = object.acceleration_percent ?? 0;
    message.deceleration_percent = object.deceleration_percent ?? 0;
    message.timer_mode = object.timer_mode ?? 0;
    return message;
  },
};

function createBaseCommand_StopSpin(): Command_StopSpin {
  return { bucket: 0 };
}

export const Command_StopSpin = {
  encode(message: Command_StopSpin, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bucket !== 0) {
      writer.uint32(8).int32(message.bucket);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_StopSpin {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_StopSpin();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.bucket = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_StopSpin {
    return { bucket: isSet(object.bucket) ? Number(object.bucket) : 0 };
  },

  toJSON(message: Command_StopSpin): unknown {
    const obj: any = {};
    message.bucket !== undefined && (obj.bucket = Math.round(message.bucket));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_StopSpin>, I>>(base?: I): Command_StopSpin {
    return Command_StopSpin.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_StopSpin>, I>>(object: I): Command_StopSpin {
    const message = createBaseCommand_StopSpin();
    message.bucket = object.bucket ?? 0;
    return message;
  },
};

function createBaseCommand_ShowDiagsDialog(): Command_ShowDiagsDialog {
  return {};
}

export const Command_ShowDiagsDialog = {
  encode(_: Command_ShowDiagsDialog, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_ShowDiagsDialog {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_ShowDiagsDialog();
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

  fromJSON(_: any): Command_ShowDiagsDialog {
    return {};
  },

  toJSON(_: Command_ShowDiagsDialog): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_ShowDiagsDialog>, I>>(base?: I): Command_ShowDiagsDialog {
    return Command_ShowDiagsDialog.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ShowDiagsDialog>, I>>(_: I): Command_ShowDiagsDialog {
    const message = createBaseCommand_ShowDiagsDialog();
    return message;
  },
};

function createBaseConfig(): Config {
  return { profile: "" };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.profile !== "") {
      writer.uint32(10).string(message.profile);
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

          message.profile = reader.string();
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
    return { profile: isSet(object.profile) ? String(object.profile) : "" };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.profile !== undefined && (obj.profile = message.profile);
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.profile = object.profile ?? "";
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
