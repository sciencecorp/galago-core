/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.spectramax";

export interface Command {
  open_drawer?: Command_OpenDrawer | undefined;
  close_drawer?: Command_CloseDrawer | undefined;
  start_read?: Command_StartRead | undefined;
}

export interface Command_OpenDrawer {}

export interface Command_CloseDrawer {}

export interface Command_StartRead {
  protocol_file: string;
  experiment_name: string;
}

export interface Config {
  protocol_dir: string;
  experiment_dir: string;
}

function createBaseCommand(): Command {
  return { open_drawer: undefined, close_drawer: undefined, start_read: undefined };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.open_drawer !== undefined) {
      Command_OpenDrawer.encode(message.open_drawer, writer.uint32(10).fork()).ldelim();
    }
    if (message.close_drawer !== undefined) {
      Command_CloseDrawer.encode(message.close_drawer, writer.uint32(18).fork()).ldelim();
    }
    if (message.start_read !== undefined) {
      Command_StartRead.encode(message.start_read, writer.uint32(26).fork()).ldelim();
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

          message.open_drawer = Command_OpenDrawer.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.close_drawer = Command_CloseDrawer.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.start_read = Command_StartRead.decode(reader, reader.uint32());
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
      open_drawer: isSet(object.open_drawer)
        ? Command_OpenDrawer.fromJSON(object.open_drawer)
        : undefined,
      close_drawer: isSet(object.close_drawer)
        ? Command_CloseDrawer.fromJSON(object.close_drawer)
        : undefined,
      start_read: isSet(object.start_read)
        ? Command_StartRead.fromJSON(object.start_read)
        : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.open_drawer !== undefined &&
      (obj.open_drawer = message.open_drawer
        ? Command_OpenDrawer.toJSON(message.open_drawer)
        : undefined);
    message.close_drawer !== undefined &&
      (obj.close_drawer = message.close_drawer
        ? Command_CloseDrawer.toJSON(message.close_drawer)
        : undefined);
    message.start_read !== undefined &&
      (obj.start_read = message.start_read
        ? Command_StartRead.toJSON(message.start_read)
        : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.open_drawer =
      object.open_drawer !== undefined && object.open_drawer !== null
        ? Command_OpenDrawer.fromPartial(object.open_drawer)
        : undefined;
    message.close_drawer =
      object.close_drawer !== undefined && object.close_drawer !== null
        ? Command_CloseDrawer.fromPartial(object.close_drawer)
        : undefined;
    message.start_read =
      object.start_read !== undefined && object.start_read !== null
        ? Command_StartRead.fromPartial(object.start_read)
        : undefined;
    return message;
  },
};

function createBaseCommand_OpenDrawer(): Command_OpenDrawer {
  return {};
}

export const Command_OpenDrawer = {
  encode(_: Command_OpenDrawer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_OpenDrawer {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_OpenDrawer();
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

  fromJSON(_: any): Command_OpenDrawer {
    return {};
  },

  toJSON(_: Command_OpenDrawer): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_OpenDrawer>, I>>(base?: I): Command_OpenDrawer {
    return Command_OpenDrawer.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_OpenDrawer>, I>>(_: I): Command_OpenDrawer {
    const message = createBaseCommand_OpenDrawer();
    return message;
  },
};

function createBaseCommand_CloseDrawer(): Command_CloseDrawer {
  return {};
}

export const Command_CloseDrawer = {
  encode(_: Command_CloseDrawer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_CloseDrawer {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_CloseDrawer();
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

  fromJSON(_: any): Command_CloseDrawer {
    return {};
  },

  toJSON(_: Command_CloseDrawer): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_CloseDrawer>, I>>(base?: I): Command_CloseDrawer {
    return Command_CloseDrawer.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_CloseDrawer>, I>>(_: I): Command_CloseDrawer {
    const message = createBaseCommand_CloseDrawer();
    return message;
  },
};

function createBaseCommand_StartRead(): Command_StartRead {
  return { protocol_file: "", experiment_name: "" };
}

export const Command_StartRead = {
  encode(message: Command_StartRead, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.protocol_file !== "") {
      writer.uint32(10).string(message.protocol_file);
    }
    if (message.experiment_name !== "") {
      writer.uint32(18).string(message.experiment_name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_StartRead {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_StartRead();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.protocol_file = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.experiment_name = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_StartRead {
    return {
      protocol_file: isSet(object.protocol_file) ? String(object.protocol_file) : "",
      experiment_name: isSet(object.experiment_name) ? String(object.experiment_name) : "",
    };
  },

  toJSON(message: Command_StartRead): unknown {
    const obj: any = {};
    message.protocol_file !== undefined && (obj.protocol_file = message.protocol_file);
    message.experiment_name !== undefined && (obj.experiment_name = message.experiment_name);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_StartRead>, I>>(base?: I): Command_StartRead {
    return Command_StartRead.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_StartRead>, I>>(object: I): Command_StartRead {
    const message = createBaseCommand_StartRead();
    message.protocol_file = object.protocol_file ?? "";
    message.experiment_name = object.experiment_name ?? "";
    return message;
  },
};

function createBaseConfig(): Config {
  return { protocol_dir: "", experiment_dir: "" };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.protocol_dir !== "") {
      writer.uint32(10).string(message.protocol_dir);
    }
    if (message.experiment_dir !== "") {
      writer.uint32(18).string(message.experiment_dir);
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

          message.protocol_dir = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.experiment_dir = reader.string();
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
      protocol_dir: isSet(object.protocol_dir) ? String(object.protocol_dir) : "",
      experiment_dir: isSet(object.experiment_dir) ? String(object.experiment_dir) : "",
    };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.protocol_dir !== undefined && (obj.protocol_dir = message.protocol_dir);
    message.experiment_dir !== undefined && (obj.experiment_dir = message.experiment_dir);
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.protocol_dir = object.protocol_dir ?? "";
    message.experiment_dir = object.experiment_dir ?? "";
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
