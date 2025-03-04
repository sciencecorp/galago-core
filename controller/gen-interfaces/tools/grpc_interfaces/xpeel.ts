/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.xpeel";

export interface Command {
  peel?: Command_Peel | undefined;
  check_status?: Command_CheckStatus | undefined;
  reset?: Command_Reset | undefined;
  restart?: Command_Restart | undefined;
  get_remaining_tape?: Command_GetRemainingTape | undefined;
}

export interface Command_Peel {
  threshold: number;
}

export interface Command_CheckStatus {
}

export interface Command_Reset {
}

export interface Command_Restart {
}

export interface Command_GetRemainingTape {
}

export interface Config {
  com_port: string;
}

function createBaseCommand(): Command {
  return {
    peel: undefined,
    check_status: undefined,
    reset: undefined,
    restart: undefined,
    get_remaining_tape: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.peel !== undefined) {
      Command_Peel.encode(message.peel, writer.uint32(10).fork()).ldelim();
    }
    if (message.check_status !== undefined) {
      Command_CheckStatus.encode(message.check_status, writer.uint32(18).fork()).ldelim();
    }
    if (message.reset !== undefined) {
      Command_Reset.encode(message.reset, writer.uint32(26).fork()).ldelim();
    }
    if (message.restart !== undefined) {
      Command_Restart.encode(message.restart, writer.uint32(34).fork()).ldelim();
    }
    if (message.get_remaining_tape !== undefined) {
      Command_GetRemainingTape.encode(message.get_remaining_tape, writer.uint32(42).fork()).ldelim();
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

          message.peel = Command_Peel.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.check_status = Command_CheckStatus.decode(reader, reader.uint32());
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

          message.restart = Command_Restart.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.get_remaining_tape = Command_GetRemainingTape.decode(reader, reader.uint32());
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
      peel: isSet(object.peel) ? Command_Peel.fromJSON(object.peel) : undefined,
      check_status: isSet(object.check_status) ? Command_CheckStatus.fromJSON(object.check_status) : undefined,
      reset: isSet(object.reset) ? Command_Reset.fromJSON(object.reset) : undefined,
      restart: isSet(object.restart) ? Command_Restart.fromJSON(object.restart) : undefined,
      get_remaining_tape: isSet(object.get_remaining_tape)
        ? Command_GetRemainingTape.fromJSON(object.get_remaining_tape)
        : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.peel !== undefined && (obj.peel = message.peel ? Command_Peel.toJSON(message.peel) : undefined);
    message.check_status !== undefined &&
      (obj.check_status = message.check_status ? Command_CheckStatus.toJSON(message.check_status) : undefined);
    message.reset !== undefined && (obj.reset = message.reset ? Command_Reset.toJSON(message.reset) : undefined);
    message.restart !== undefined &&
      (obj.restart = message.restart ? Command_Restart.toJSON(message.restart) : undefined);
    message.get_remaining_tape !== undefined && (obj.get_remaining_tape = message.get_remaining_tape
      ? Command_GetRemainingTape.toJSON(message.get_remaining_tape)
      : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.peel = (object.peel !== undefined && object.peel !== null)
      ? Command_Peel.fromPartial(object.peel)
      : undefined;
    message.check_status = (object.check_status !== undefined && object.check_status !== null)
      ? Command_CheckStatus.fromPartial(object.check_status)
      : undefined;
    message.reset = (object.reset !== undefined && object.reset !== null)
      ? Command_Reset.fromPartial(object.reset)
      : undefined;
    message.restart = (object.restart !== undefined && object.restart !== null)
      ? Command_Restart.fromPartial(object.restart)
      : undefined;
    message.get_remaining_tape = (object.get_remaining_tape !== undefined && object.get_remaining_tape !== null)
      ? Command_GetRemainingTape.fromPartial(object.get_remaining_tape)
      : undefined;
    return message;
  },
};

function createBaseCommand_Peel(): Command_Peel {
  return { threshold: 0 };
}

export const Command_Peel = {
  encode(message: Command_Peel, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.threshold !== 0) {
      writer.uint32(8).int32(message.threshold);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Peel {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Peel();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.threshold = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Peel {
    return { threshold: isSet(object.threshold) ? Number(object.threshold) : 0 };
  },

  toJSON(message: Command_Peel): unknown {
    const obj: any = {};
    message.threshold !== undefined && (obj.threshold = Math.round(message.threshold));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Peel>, I>>(base?: I): Command_Peel {
    return Command_Peel.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Peel>, I>>(object: I): Command_Peel {
    const message = createBaseCommand_Peel();
    message.threshold = object.threshold ?? 0;
    return message;
  },
};

function createBaseCommand_CheckStatus(): Command_CheckStatus {
  return {};
}

export const Command_CheckStatus = {
  encode(_: Command_CheckStatus, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_CheckStatus {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_CheckStatus();
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

  fromJSON(_: any): Command_CheckStatus {
    return {};
  },

  toJSON(_: Command_CheckStatus): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_CheckStatus>, I>>(base?: I): Command_CheckStatus {
    return Command_CheckStatus.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_CheckStatus>, I>>(_: I): Command_CheckStatus {
    const message = createBaseCommand_CheckStatus();
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

function createBaseCommand_Restart(): Command_Restart {
  return {};
}

export const Command_Restart = {
  encode(_: Command_Restart, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Restart {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Restart();
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

  fromJSON(_: any): Command_Restart {
    return {};
  },

  toJSON(_: Command_Restart): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Restart>, I>>(base?: I): Command_Restart {
    return Command_Restart.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Restart>, I>>(_: I): Command_Restart {
    const message = createBaseCommand_Restart();
    return message;
  },
};

function createBaseCommand_GetRemainingTape(): Command_GetRemainingTape {
  return {};
}

export const Command_GetRemainingTape = {
  encode(_: Command_GetRemainingTape, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetRemainingTape {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetRemainingTape();
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

  fromJSON(_: any): Command_GetRemainingTape {
    return {};
  },

  toJSON(_: Command_GetRemainingTape): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetRemainingTape>, I>>(base?: I): Command_GetRemainingTape {
    return Command_GetRemainingTape.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetRemainingTape>, I>>(_: I): Command_GetRemainingTape {
    const message = createBaseCommand_GetRemainingTape();
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
