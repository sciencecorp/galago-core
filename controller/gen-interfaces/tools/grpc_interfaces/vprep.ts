/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.vprep";

export interface Command {
  initialize?: Command_Initialize | undefined;
  run_protocol?: Command_RunProtocol | undefined;
  run_runset?: Command_RunRunset | undefined;
}

export interface Command_Initialize {
}

export interface Command_RunProtocol {
  protocol_file: string;
}

export interface Command_RunRunset {
  runset_file: string;
}

export interface Config {
  device_file: string;
}

function createBaseCommand(): Command {
  return { initialize: undefined, run_protocol: undefined, run_runset: undefined };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.initialize !== undefined) {
      Command_Initialize.encode(message.initialize, writer.uint32(10).fork()).ldelim();
    }
    if (message.run_protocol !== undefined) {
      Command_RunProtocol.encode(message.run_protocol, writer.uint32(18).fork()).ldelim();
    }
    if (message.run_runset !== undefined) {
      Command_RunRunset.encode(message.run_runset, writer.uint32(26).fork()).ldelim();
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

          message.initialize = Command_Initialize.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.run_protocol = Command_RunProtocol.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.run_runset = Command_RunRunset.decode(reader, reader.uint32());
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
      initialize: isSet(object.initialize) ? Command_Initialize.fromJSON(object.initialize) : undefined,
      run_protocol: isSet(object.run_protocol) ? Command_RunProtocol.fromJSON(object.run_protocol) : undefined,
      run_runset: isSet(object.run_runset) ? Command_RunRunset.fromJSON(object.run_runset) : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.initialize !== undefined &&
      (obj.initialize = message.initialize ? Command_Initialize.toJSON(message.initialize) : undefined);
    message.run_protocol !== undefined &&
      (obj.run_protocol = message.run_protocol ? Command_RunProtocol.toJSON(message.run_protocol) : undefined);
    message.run_runset !== undefined &&
      (obj.run_runset = message.run_runset ? Command_RunRunset.toJSON(message.run_runset) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.initialize = (object.initialize !== undefined && object.initialize !== null)
      ? Command_Initialize.fromPartial(object.initialize)
      : undefined;
    message.run_protocol = (object.run_protocol !== undefined && object.run_protocol !== null)
      ? Command_RunProtocol.fromPartial(object.run_protocol)
      : undefined;
    message.run_runset = (object.run_runset !== undefined && object.run_runset !== null)
      ? Command_RunRunset.fromPartial(object.run_runset)
      : undefined;
    return message;
  },
};

function createBaseCommand_Initialize(): Command_Initialize {
  return {};
}

export const Command_Initialize = {
  encode(_: Command_Initialize, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Initialize {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Initialize();
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

  fromJSON(_: any): Command_Initialize {
    return {};
  },

  toJSON(_: Command_Initialize): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Initialize>, I>>(base?: I): Command_Initialize {
    return Command_Initialize.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Initialize>, I>>(_: I): Command_Initialize {
    const message = createBaseCommand_Initialize();
    return message;
  },
};

function createBaseCommand_RunProtocol(): Command_RunProtocol {
  return { protocol_file: "" };
}

export const Command_RunProtocol = {
  encode(message: Command_RunProtocol, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.protocol_file !== "") {
      writer.uint32(10).string(message.protocol_file);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_RunProtocol {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_RunProtocol();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.protocol_file = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_RunProtocol {
    return { protocol_file: isSet(object.protocol_file) ? String(object.protocol_file) : "" };
  },

  toJSON(message: Command_RunProtocol): unknown {
    const obj: any = {};
    message.protocol_file !== undefined && (obj.protocol_file = message.protocol_file);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RunProtocol>, I>>(base?: I): Command_RunProtocol {
    return Command_RunProtocol.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RunProtocol>, I>>(object: I): Command_RunProtocol {
    const message = createBaseCommand_RunProtocol();
    message.protocol_file = object.protocol_file ?? "";
    return message;
  },
};

function createBaseCommand_RunRunset(): Command_RunRunset {
  return { runset_file: "" };
}

export const Command_RunRunset = {
  encode(message: Command_RunRunset, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.runset_file !== "") {
      writer.uint32(10).string(message.runset_file);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_RunRunset {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_RunRunset();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.runset_file = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_RunRunset {
    return { runset_file: isSet(object.runset_file) ? String(object.runset_file) : "" };
  },

  toJSON(message: Command_RunRunset): unknown {
    const obj: any = {};
    message.runset_file !== undefined && (obj.runset_file = message.runset_file);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RunRunset>, I>>(base?: I): Command_RunRunset {
    return Command_RunRunset.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RunRunset>, I>>(object: I): Command_RunRunset {
    const message = createBaseCommand_RunRunset();
    message.runset_file = object.runset_file ?? "";
    return message;
  },
};

function createBaseConfig(): Config {
  return { device_file: "" };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.device_file !== "") {
      writer.uint32(10).string(message.device_file);
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

          message.device_file = reader.string();
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
    return { device_file: isSet(object.device_file) ? String(object.device_file) : "" };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.device_file !== undefined && (obj.device_file = message.device_file);
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.device_file = object.device_file ?? "";
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
