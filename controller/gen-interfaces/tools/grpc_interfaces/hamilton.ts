/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.hamilton";

export interface Command {
  run_protocol?: Command_RunProtocol | undefined;
  load_protocol?: Command_LoadProtocol | undefined;
}

export interface Command_RunProtocol {
  protocol: string;
}

export interface Command_LoadProtocol {
  protocol: string;
}

export interface Config {}

function createBaseCommand(): Command {
  return { run_protocol: undefined, load_protocol: undefined };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.run_protocol !== undefined) {
      Command_RunProtocol.encode(message.run_protocol, writer.uint32(10).fork()).ldelim();
    }
    if (message.load_protocol !== undefined) {
      Command_LoadProtocol.encode(message.load_protocol, writer.uint32(18).fork()).ldelim();
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

          message.run_protocol = Command_RunProtocol.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.load_protocol = Command_LoadProtocol.decode(reader, reader.uint32());
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
      run_protocol: isSet(object.run_protocol)
        ? Command_RunProtocol.fromJSON(object.run_protocol)
        : undefined,
      load_protocol: isSet(object.load_protocol)
        ? Command_LoadProtocol.fromJSON(object.load_protocol)
        : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.run_protocol !== undefined &&
      (obj.run_protocol = message.run_protocol
        ? Command_RunProtocol.toJSON(message.run_protocol)
        : undefined);
    message.load_protocol !== undefined &&
      (obj.load_protocol = message.load_protocol
        ? Command_LoadProtocol.toJSON(message.load_protocol)
        : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.run_protocol =
      object.run_protocol !== undefined && object.run_protocol !== null
        ? Command_RunProtocol.fromPartial(object.run_protocol)
        : undefined;
    message.load_protocol =
      object.load_protocol !== undefined && object.load_protocol !== null
        ? Command_LoadProtocol.fromPartial(object.load_protocol)
        : undefined;
    return message;
  },
};

function createBaseCommand_RunProtocol(): Command_RunProtocol {
  return { protocol: "" };
}

export const Command_RunProtocol = {
  encode(message: Command_RunProtocol, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.protocol !== "") {
      writer.uint32(10).string(message.protocol);
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

          message.protocol = reader.string();
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
    return { protocol: isSet(object.protocol) ? String(object.protocol) : "" };
  },

  toJSON(message: Command_RunProtocol): unknown {
    const obj: any = {};
    message.protocol !== undefined && (obj.protocol = message.protocol);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RunProtocol>, I>>(base?: I): Command_RunProtocol {
    return Command_RunProtocol.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RunProtocol>, I>>(
    object: I,
  ): Command_RunProtocol {
    const message = createBaseCommand_RunProtocol();
    message.protocol = object.protocol ?? "";
    return message;
  },
};

function createBaseCommand_LoadProtocol(): Command_LoadProtocol {
  return { protocol: "" };
}

export const Command_LoadProtocol = {
  encode(message: Command_LoadProtocol, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.protocol !== "") {
      writer.uint32(10).string(message.protocol);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_LoadProtocol {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_LoadProtocol();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.protocol = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_LoadProtocol {
    return { protocol: isSet(object.protocol) ? String(object.protocol) : "" };
  },

  toJSON(message: Command_LoadProtocol): unknown {
    const obj: any = {};
    message.protocol !== undefined && (obj.protocol = message.protocol);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_LoadProtocol>, I>>(base?: I): Command_LoadProtocol {
    return Command_LoadProtocol.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_LoadProtocol>, I>>(
    object: I,
  ): Command_LoadProtocol {
    const message = createBaseCommand_LoadProtocol();
    message.protocol = object.protocol ?? "";
    return message;
  },
};

function createBaseConfig(): Config {
  return {};
}

export const Config = {
  encode(_: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Config {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConfig();
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

  fromJSON(_: any): Config {
    return {};
  },

  toJSON(_: Config): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(_: I): Config {
    const message = createBaseConfig();
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
