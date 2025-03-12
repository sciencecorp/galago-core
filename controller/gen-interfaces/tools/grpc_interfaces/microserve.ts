/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.microserve";

export interface Command {
  load?: Command_Load | undefined;
  unload?: Command_Unload | undefined;
  home?: Command_Home | undefined;
  abort?: Command_Abort | undefined;
  retract?: Command_Retract | undefined;
  go_to?: Command_GoTo | undefined;
  set_plate_dimensions?: Command_SetPlateDimensions | undefined;
  raw_command?: Command_SendRawCommand | undefined;
}

export interface Command_Load {
  stack_id: number;
}

export interface Command_Unload {
  stack_id: number;
}

export interface Command_Home {
}

export interface Command_Abort {
}

export interface Command_Retract {
}

export interface Command_GoTo {
  stack_id: number;
}

export interface Command_SetPlateDimensions {
  plate_height: number;
  stack_height: number;
  plate_thickness: number;
}

export interface Command_SendRawCommand {
  command: string;
}

export interface Config {
  ip: string;
  port: number;
}

function createBaseCommand(): Command {
  return {
    load: undefined,
    unload: undefined,
    home: undefined,
    abort: undefined,
    retract: undefined,
    go_to: undefined,
    set_plate_dimensions: undefined,
    raw_command: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.load !== undefined) {
      Command_Load.encode(message.load, writer.uint32(10).fork()).ldelim();
    }
    if (message.unload !== undefined) {
      Command_Unload.encode(message.unload, writer.uint32(18).fork()).ldelim();
    }
    if (message.home !== undefined) {
      Command_Home.encode(message.home, writer.uint32(26).fork()).ldelim();
    }
    if (message.abort !== undefined) {
      Command_Abort.encode(message.abort, writer.uint32(34).fork()).ldelim();
    }
    if (message.retract !== undefined) {
      Command_Retract.encode(message.retract, writer.uint32(42).fork()).ldelim();
    }
    if (message.go_to !== undefined) {
      Command_GoTo.encode(message.go_to, writer.uint32(50).fork()).ldelim();
    }
    if (message.set_plate_dimensions !== undefined) {
      Command_SetPlateDimensions.encode(message.set_plate_dimensions, writer.uint32(58).fork()).ldelim();
    }
    if (message.raw_command !== undefined) {
      Command_SendRawCommand.encode(message.raw_command, writer.uint32(66).fork()).ldelim();
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

          message.load = Command_Load.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.unload = Command_Unload.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.home = Command_Home.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.abort = Command_Abort.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.retract = Command_Retract.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.go_to = Command_GoTo.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.set_plate_dimensions = Command_SetPlateDimensions.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.raw_command = Command_SendRawCommand.decode(reader, reader.uint32());
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
      load: isSet(object.load) ? Command_Load.fromJSON(object.load) : undefined,
      unload: isSet(object.unload) ? Command_Unload.fromJSON(object.unload) : undefined,
      home: isSet(object.home) ? Command_Home.fromJSON(object.home) : undefined,
      abort: isSet(object.abort) ? Command_Abort.fromJSON(object.abort) : undefined,
      retract: isSet(object.retract) ? Command_Retract.fromJSON(object.retract) : undefined,
      go_to: isSet(object.go_to) ? Command_GoTo.fromJSON(object.go_to) : undefined,
      set_plate_dimensions: isSet(object.set_plate_dimensions)
        ? Command_SetPlateDimensions.fromJSON(object.set_plate_dimensions)
        : undefined,
      raw_command: isSet(object.raw_command) ? Command_SendRawCommand.fromJSON(object.raw_command) : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.load !== undefined && (obj.load = message.load ? Command_Load.toJSON(message.load) : undefined);
    message.unload !== undefined && (obj.unload = message.unload ? Command_Unload.toJSON(message.unload) : undefined);
    message.home !== undefined && (obj.home = message.home ? Command_Home.toJSON(message.home) : undefined);
    message.abort !== undefined && (obj.abort = message.abort ? Command_Abort.toJSON(message.abort) : undefined);
    message.retract !== undefined &&
      (obj.retract = message.retract ? Command_Retract.toJSON(message.retract) : undefined);
    message.go_to !== undefined && (obj.go_to = message.go_to ? Command_GoTo.toJSON(message.go_to) : undefined);
    message.set_plate_dimensions !== undefined && (obj.set_plate_dimensions = message.set_plate_dimensions
      ? Command_SetPlateDimensions.toJSON(message.set_plate_dimensions)
      : undefined);
    message.raw_command !== undefined &&
      (obj.raw_command = message.raw_command ? Command_SendRawCommand.toJSON(message.raw_command) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.load = (object.load !== undefined && object.load !== null)
      ? Command_Load.fromPartial(object.load)
      : undefined;
    message.unload = (object.unload !== undefined && object.unload !== null)
      ? Command_Unload.fromPartial(object.unload)
      : undefined;
    message.home = (object.home !== undefined && object.home !== null)
      ? Command_Home.fromPartial(object.home)
      : undefined;
    message.abort = (object.abort !== undefined && object.abort !== null)
      ? Command_Abort.fromPartial(object.abort)
      : undefined;
    message.retract = (object.retract !== undefined && object.retract !== null)
      ? Command_Retract.fromPartial(object.retract)
      : undefined;
    message.go_to = (object.go_to !== undefined && object.go_to !== null)
      ? Command_GoTo.fromPartial(object.go_to)
      : undefined;
    message.set_plate_dimensions = (object.set_plate_dimensions !== undefined && object.set_plate_dimensions !== null)
      ? Command_SetPlateDimensions.fromPartial(object.set_plate_dimensions)
      : undefined;
    message.raw_command = (object.raw_command !== undefined && object.raw_command !== null)
      ? Command_SendRawCommand.fromPartial(object.raw_command)
      : undefined;
    return message;
  },
};

function createBaseCommand_Load(): Command_Load {
  return { stack_id: 0 };
}

export const Command_Load = {
  encode(message: Command_Load, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.stack_id !== 0) {
      writer.uint32(8).int32(message.stack_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Load {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Load();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.stack_id = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Load {
    return { stack_id: isSet(object.stack_id) ? Number(object.stack_id) : 0 };
  },

  toJSON(message: Command_Load): unknown {
    const obj: any = {};
    message.stack_id !== undefined && (obj.stack_id = Math.round(message.stack_id));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Load>, I>>(base?: I): Command_Load {
    return Command_Load.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Load>, I>>(object: I): Command_Load {
    const message = createBaseCommand_Load();
    message.stack_id = object.stack_id ?? 0;
    return message;
  },
};

function createBaseCommand_Unload(): Command_Unload {
  return { stack_id: 0 };
}

export const Command_Unload = {
  encode(message: Command_Unload, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.stack_id !== 0) {
      writer.uint32(8).int32(message.stack_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Unload {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Unload();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.stack_id = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Unload {
    return { stack_id: isSet(object.stack_id) ? Number(object.stack_id) : 0 };
  },

  toJSON(message: Command_Unload): unknown {
    const obj: any = {};
    message.stack_id !== undefined && (obj.stack_id = Math.round(message.stack_id));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Unload>, I>>(base?: I): Command_Unload {
    return Command_Unload.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Unload>, I>>(object: I): Command_Unload {
    const message = createBaseCommand_Unload();
    message.stack_id = object.stack_id ?? 0;
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

function createBaseCommand_Abort(): Command_Abort {
  return {};
}

export const Command_Abort = {
  encode(_: Command_Abort, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Abort {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Abort();
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

  fromJSON(_: any): Command_Abort {
    return {};
  },

  toJSON(_: Command_Abort): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Abort>, I>>(base?: I): Command_Abort {
    return Command_Abort.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Abort>, I>>(_: I): Command_Abort {
    const message = createBaseCommand_Abort();
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

function createBaseCommand_GoTo(): Command_GoTo {
  return { stack_id: 0 };
}

export const Command_GoTo = {
  encode(message: Command_GoTo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.stack_id !== 0) {
      writer.uint32(8).int32(message.stack_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GoTo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GoTo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.stack_id = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_GoTo {
    return { stack_id: isSet(object.stack_id) ? Number(object.stack_id) : 0 };
  },

  toJSON(message: Command_GoTo): unknown {
    const obj: any = {};
    message.stack_id !== undefined && (obj.stack_id = Math.round(message.stack_id));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GoTo>, I>>(base?: I): Command_GoTo {
    return Command_GoTo.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GoTo>, I>>(object: I): Command_GoTo {
    const message = createBaseCommand_GoTo();
    message.stack_id = object.stack_id ?? 0;
    return message;
  },
};

function createBaseCommand_SetPlateDimensions(): Command_SetPlateDimensions {
  return { plate_height: 0, stack_height: 0, plate_thickness: 0 };
}

export const Command_SetPlateDimensions = {
  encode(message: Command_SetPlateDimensions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plate_height !== 0) {
      writer.uint32(13).float(message.plate_height);
    }
    if (message.stack_height !== 0) {
      writer.uint32(21).float(message.stack_height);
    }
    if (message.plate_thickness !== 0) {
      writer.uint32(29).float(message.plate_thickness);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SetPlateDimensions {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SetPlateDimensions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.plate_height = reader.float();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.stack_height = reader.float();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.plate_thickness = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_SetPlateDimensions {
    return {
      plate_height: isSet(object.plate_height) ? Number(object.plate_height) : 0,
      stack_height: isSet(object.stack_height) ? Number(object.stack_height) : 0,
      plate_thickness: isSet(object.plate_thickness) ? Number(object.plate_thickness) : 0,
    };
  },

  toJSON(message: Command_SetPlateDimensions): unknown {
    const obj: any = {};
    message.plate_height !== undefined && (obj.plate_height = message.plate_height);
    message.stack_height !== undefined && (obj.stack_height = message.stack_height);
    message.plate_thickness !== undefined && (obj.plate_thickness = message.plate_thickness);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SetPlateDimensions>, I>>(base?: I): Command_SetPlateDimensions {
    return Command_SetPlateDimensions.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SetPlateDimensions>, I>>(object: I): Command_SetPlateDimensions {
    const message = createBaseCommand_SetPlateDimensions();
    message.plate_height = object.plate_height ?? 0;
    message.stack_height = object.stack_height ?? 0;
    message.plate_thickness = object.plate_thickness ?? 0;
    return message;
  },
};

function createBaseCommand_SendRawCommand(): Command_SendRawCommand {
  return { command: "" };
}

export const Command_SendRawCommand = {
  encode(message: Command_SendRawCommand, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.command !== "") {
      writer.uint32(10).string(message.command);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SendRawCommand {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SendRawCommand();
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

  fromJSON(object: any): Command_SendRawCommand {
    return { command: isSet(object.command) ? String(object.command) : "" };
  },

  toJSON(message: Command_SendRawCommand): unknown {
    const obj: any = {};
    message.command !== undefined && (obj.command = message.command);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SendRawCommand>, I>>(base?: I): Command_SendRawCommand {
    return Command_SendRawCommand.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SendRawCommand>, I>>(object: I): Command_SendRawCommand {
    const message = createBaseCommand_SendRawCommand();
    message.command = object.command ?? "";
    return message;
  },
};

function createBaseConfig(): Config {
  return { ip: "", port: 0 };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.ip !== "") {
      writer.uint32(10).string(message.ip);
    }
    if (message.port !== 0) {
      writer.uint32(16).int32(message.port);
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

          message.ip = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.port = reader.int32();
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
    return { ip: isSet(object.ip) ? String(object.ip) : "", port: isSet(object.port) ? Number(object.port) : 0 };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.ip !== undefined && (obj.ip = message.ip);
    message.port !== undefined && (obj.port = Math.round(message.port));
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.ip = object.ip ?? "";
    message.port = object.port ?? 0;
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
