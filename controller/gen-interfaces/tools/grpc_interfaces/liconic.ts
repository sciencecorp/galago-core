/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.liconic";

export interface Command {
  fetch_plate?: Command_FetchPlate | undefined;
  store_plate?: Command_StorePlate | undefined;
  reset?: Command_Reset | undefined;
  raw_command?: Command_SendRawCommand | undefined;
}

export interface Command_FetchPlate {
  cassette: number;
  level: number;
  wait_time?: number | undefined;
}

export interface Command_StorePlate {
  cassette: number;
  level: number;
  wait_time?: number | undefined;
}

export interface Command_SendRawCommand {
  cmd: string;
}

export interface Command_Reset {}

export interface Config {
  com_port: string;
}

function createBaseCommand(): Command {
  return {
    fetch_plate: undefined,
    store_plate: undefined,
    reset: undefined,
    raw_command: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.fetch_plate !== undefined) {
      Command_FetchPlate.encode(message.fetch_plate, writer.uint32(10).fork()).ldelim();
    }
    if (message.store_plate !== undefined) {
      Command_StorePlate.encode(message.store_plate, writer.uint32(18).fork()).ldelim();
    }
    if (message.reset !== undefined) {
      Command_Reset.encode(message.reset, writer.uint32(26).fork()).ldelim();
    }
    if (message.raw_command !== undefined) {
      Command_SendRawCommand.encode(message.raw_command, writer.uint32(34).fork()).ldelim();
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

          message.fetch_plate = Command_FetchPlate.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.store_plate = Command_StorePlate.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.reset = Command_Reset.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
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
      fetch_plate: isSet(object.fetch_plate)
        ? Command_FetchPlate.fromJSON(object.fetch_plate)
        : undefined,
      store_plate: isSet(object.store_plate)
        ? Command_StorePlate.fromJSON(object.store_plate)
        : undefined,
      reset: isSet(object.reset) ? Command_Reset.fromJSON(object.reset) : undefined,
      raw_command: isSet(object.raw_command)
        ? Command_SendRawCommand.fromJSON(object.raw_command)
        : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.fetch_plate !== undefined &&
      (obj.fetch_plate = message.fetch_plate
        ? Command_FetchPlate.toJSON(message.fetch_plate)
        : undefined);
    message.store_plate !== undefined &&
      (obj.store_plate = message.store_plate
        ? Command_StorePlate.toJSON(message.store_plate)
        : undefined);
    message.reset !== undefined &&
      (obj.reset = message.reset ? Command_Reset.toJSON(message.reset) : undefined);
    message.raw_command !== undefined &&
      (obj.raw_command = message.raw_command
        ? Command_SendRawCommand.toJSON(message.raw_command)
        : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.fetch_plate =
      object.fetch_plate !== undefined && object.fetch_plate !== null
        ? Command_FetchPlate.fromPartial(object.fetch_plate)
        : undefined;
    message.store_plate =
      object.store_plate !== undefined && object.store_plate !== null
        ? Command_StorePlate.fromPartial(object.store_plate)
        : undefined;
    message.reset =
      object.reset !== undefined && object.reset !== null
        ? Command_Reset.fromPartial(object.reset)
        : undefined;
    message.raw_command =
      object.raw_command !== undefined && object.raw_command !== null
        ? Command_SendRawCommand.fromPartial(object.raw_command)
        : undefined;
    return message;
  },
};

function createBaseCommand_FetchPlate(): Command_FetchPlate {
  return { cassette: 0, level: 0, wait_time: undefined };
}

export const Command_FetchPlate = {
  encode(message: Command_FetchPlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.cassette !== 0) {
      writer.uint32(8).int32(message.cassette);
    }
    if (message.level !== 0) {
      writer.uint32(16).int32(message.level);
    }
    if (message.wait_time !== undefined) {
      writer.uint32(24).int32(message.wait_time);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_FetchPlate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_FetchPlate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.cassette = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.level = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.wait_time = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_FetchPlate {
    return {
      cassette: isSet(object.cassette) ? Number(object.cassette) : 0,
      level: isSet(object.level) ? Number(object.level) : 0,
      wait_time: isSet(object.wait_time) ? Number(object.wait_time) : undefined,
    };
  },

  toJSON(message: Command_FetchPlate): unknown {
    const obj: any = {};
    message.cassette !== undefined && (obj.cassette = Math.round(message.cassette));
    message.level !== undefined && (obj.level = Math.round(message.level));
    message.wait_time !== undefined && (obj.wait_time = Math.round(message.wait_time));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_FetchPlate>, I>>(base?: I): Command_FetchPlate {
    return Command_FetchPlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_FetchPlate>, I>>(object: I): Command_FetchPlate {
    const message = createBaseCommand_FetchPlate();
    message.cassette = object.cassette ?? 0;
    message.level = object.level ?? 0;
    message.wait_time = object.wait_time ?? undefined;
    return message;
  },
};

function createBaseCommand_StorePlate(): Command_StorePlate {
  return { cassette: 0, level: 0, wait_time: undefined };
}

export const Command_StorePlate = {
  encode(message: Command_StorePlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.cassette !== 0) {
      writer.uint32(8).int32(message.cassette);
    }
    if (message.level !== 0) {
      writer.uint32(16).int32(message.level);
    }
    if (message.wait_time !== undefined) {
      writer.uint32(24).int32(message.wait_time);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_StorePlate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_StorePlate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.cassette = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.level = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.wait_time = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_StorePlate {
    return {
      cassette: isSet(object.cassette) ? Number(object.cassette) : 0,
      level: isSet(object.level) ? Number(object.level) : 0,
      wait_time: isSet(object.wait_time) ? Number(object.wait_time) : undefined,
    };
  },

  toJSON(message: Command_StorePlate): unknown {
    const obj: any = {};
    message.cassette !== undefined && (obj.cassette = Math.round(message.cassette));
    message.level !== undefined && (obj.level = Math.round(message.level));
    message.wait_time !== undefined && (obj.wait_time = Math.round(message.wait_time));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_StorePlate>, I>>(base?: I): Command_StorePlate {
    return Command_StorePlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_StorePlate>, I>>(object: I): Command_StorePlate {
    const message = createBaseCommand_StorePlate();
    message.cassette = object.cassette ?? 0;
    message.level = object.level ?? 0;
    message.wait_time = object.wait_time ?? undefined;
    return message;
  },
};

function createBaseCommand_SendRawCommand(): Command_SendRawCommand {
  return { cmd: "" };
}

export const Command_SendRawCommand = {
  encode(message: Command_SendRawCommand, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.cmd !== "") {
      writer.uint32(10).string(message.cmd);
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

          message.cmd = reader.string();
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
    return { cmd: isSet(object.cmd) ? String(object.cmd) : "" };
  },

  toJSON(message: Command_SendRawCommand): unknown {
    const obj: any = {};
    message.cmd !== undefined && (obj.cmd = message.cmd);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SendRawCommand>, I>>(
    base?: I,
  ): Command_SendRawCommand {
    return Command_SendRawCommand.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SendRawCommand>, I>>(
    object: I,
  ): Command_SendRawCommand {
    const message = createBaseCommand_SendRawCommand();
    message.cmd = object.cmd ?? "";
    return message;
  },
};

function createBaseCommand_Reset(): Command_Reset {
  return {};
}

export const Command_Reset = {
  encode(_: Command_Reset, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Reset {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Reset();
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

  fromJSON(_: any): Command_Reset {
    return {};
  },

  toJSON(_: Command_Reset): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Reset>, I>>(base?: I): Command_Reset {
    return Command_Reset.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Reset>, I>>(_: I): Command_Reset {
    const message = createBaseCommand_Reset();
    return message;
  },
};

function createBaseConfig(): Config {
  return { com_port: "" };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.com_port !== "") {
      writer.uint32(10).string(message.com_port);
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

          message.com_port = reader.string();
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
    return { com_port: isSet(object.com_port) ? String(object.com_port) : "" };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.com_port !== undefined && (obj.com_port = message.com_port);
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.com_port = object.com_port ?? "";
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
