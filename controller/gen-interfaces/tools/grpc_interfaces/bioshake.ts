/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.bioshake";

export interface Command {
  grip?: Command_Grip | undefined;
  ungrip?: Command_Ungrip | undefined;
  home?: Command_Home | undefined;
  start_shake?: Command_StartShake | undefined;
  stop_shake?: Command_StopShake | undefined;
  reset?: Command_Reset | undefined;
  wait_for_shake_to_finish?: Command_WaitForShakeToFinish | undefined;
}

export interface Command_Grip {
}

export interface Command_Ungrip {
}

export interface Command_Home {
}

export interface Command_StartShake {
  speed: number;
  duration: number;
}

export interface Command_StopShake {
}

export interface Command_Reset {
}

export interface Command_WaitForShakeToFinish {
  timeout: number;
}

export interface Config {
  com_port: string;
  tool_id: string;
}

function createBaseCommand(): Command {
  return {
    grip: undefined,
    ungrip: undefined,
    home: undefined,
    start_shake: undefined,
    stop_shake: undefined,
    reset: undefined,
    wait_for_shake_to_finish: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.grip !== undefined) {
      Command_Grip.encode(message.grip, writer.uint32(10).fork()).ldelim();
    }
    if (message.ungrip !== undefined) {
      Command_Ungrip.encode(message.ungrip, writer.uint32(18).fork()).ldelim();
    }
    if (message.home !== undefined) {
      Command_Home.encode(message.home, writer.uint32(26).fork()).ldelim();
    }
    if (message.start_shake !== undefined) {
      Command_StartShake.encode(message.start_shake, writer.uint32(34).fork()).ldelim();
    }
    if (message.stop_shake !== undefined) {
      Command_StopShake.encode(message.stop_shake, writer.uint32(42).fork()).ldelim();
    }
    if (message.reset !== undefined) {
      Command_Reset.encode(message.reset, writer.uint32(50).fork()).ldelim();
    }
    if (message.wait_for_shake_to_finish !== undefined) {
      Command_WaitForShakeToFinish.encode(message.wait_for_shake_to_finish, writer.uint32(58).fork()).ldelim();
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

          message.grip = Command_Grip.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.ungrip = Command_Ungrip.decode(reader, reader.uint32());
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

          message.start_shake = Command_StartShake.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.stop_shake = Command_StopShake.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.reset = Command_Reset.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.wait_for_shake_to_finish = Command_WaitForShakeToFinish.decode(reader, reader.uint32());
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
      grip: isSet(object.grip) ? Command_Grip.fromJSON(object.grip) : undefined,
      ungrip: isSet(object.ungrip) ? Command_Ungrip.fromJSON(object.ungrip) : undefined,
      home: isSet(object.home) ? Command_Home.fromJSON(object.home) : undefined,
      start_shake: isSet(object.start_shake) ? Command_StartShake.fromJSON(object.start_shake) : undefined,
      stop_shake: isSet(object.stop_shake) ? Command_StopShake.fromJSON(object.stop_shake) : undefined,
      reset: isSet(object.reset) ? Command_Reset.fromJSON(object.reset) : undefined,
      wait_for_shake_to_finish: isSet(object.wait_for_shake_to_finish)
        ? Command_WaitForShakeToFinish.fromJSON(object.wait_for_shake_to_finish)
        : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.grip !== undefined && (obj.grip = message.grip ? Command_Grip.toJSON(message.grip) : undefined);
    message.ungrip !== undefined && (obj.ungrip = message.ungrip ? Command_Ungrip.toJSON(message.ungrip) : undefined);
    message.home !== undefined && (obj.home = message.home ? Command_Home.toJSON(message.home) : undefined);
    message.start_shake !== undefined &&
      (obj.start_shake = message.start_shake ? Command_StartShake.toJSON(message.start_shake) : undefined);
    message.stop_shake !== undefined &&
      (obj.stop_shake = message.stop_shake ? Command_StopShake.toJSON(message.stop_shake) : undefined);
    message.reset !== undefined && (obj.reset = message.reset ? Command_Reset.toJSON(message.reset) : undefined);
    message.wait_for_shake_to_finish !== undefined && (obj.wait_for_shake_to_finish = message.wait_for_shake_to_finish
      ? Command_WaitForShakeToFinish.toJSON(message.wait_for_shake_to_finish)
      : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.grip = (object.grip !== undefined && object.grip !== null)
      ? Command_Grip.fromPartial(object.grip)
      : undefined;
    message.ungrip = (object.ungrip !== undefined && object.ungrip !== null)
      ? Command_Ungrip.fromPartial(object.ungrip)
      : undefined;
    message.home = (object.home !== undefined && object.home !== null)
      ? Command_Home.fromPartial(object.home)
      : undefined;
    message.start_shake = (object.start_shake !== undefined && object.start_shake !== null)
      ? Command_StartShake.fromPartial(object.start_shake)
      : undefined;
    message.stop_shake = (object.stop_shake !== undefined && object.stop_shake !== null)
      ? Command_StopShake.fromPartial(object.stop_shake)
      : undefined;
    message.reset = (object.reset !== undefined && object.reset !== null)
      ? Command_Reset.fromPartial(object.reset)
      : undefined;
    message.wait_for_shake_to_finish =
      (object.wait_for_shake_to_finish !== undefined && object.wait_for_shake_to_finish !== null)
        ? Command_WaitForShakeToFinish.fromPartial(object.wait_for_shake_to_finish)
        : undefined;
    return message;
  },
};

function createBaseCommand_Grip(): Command_Grip {
  return {};
}

export const Command_Grip = {
  encode(_: Command_Grip, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Grip {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Grip();
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

  fromJSON(_: any): Command_Grip {
    return {};
  },

  toJSON(_: Command_Grip): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Grip>, I>>(base?: I): Command_Grip {
    return Command_Grip.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Grip>, I>>(_: I): Command_Grip {
    const message = createBaseCommand_Grip();
    return message;
  },
};

function createBaseCommand_Ungrip(): Command_Ungrip {
  return {};
}

export const Command_Ungrip = {
  encode(_: Command_Ungrip, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Ungrip {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Ungrip();
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

  fromJSON(_: any): Command_Ungrip {
    return {};
  },

  toJSON(_: Command_Ungrip): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Ungrip>, I>>(base?: I): Command_Ungrip {
    return Command_Ungrip.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Ungrip>, I>>(_: I): Command_Ungrip {
    const message = createBaseCommand_Ungrip();
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

function createBaseCommand_StartShake(): Command_StartShake {
  return { speed: 0, duration: 0 };
}

export const Command_StartShake = {
  encode(message: Command_StartShake, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.speed !== 0) {
      writer.uint32(8).int32(message.speed);
    }
    if (message.duration !== 0) {
      writer.uint32(16).int32(message.duration);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_StartShake {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_StartShake();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.speed = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
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

  fromJSON(object: any): Command_StartShake {
    return {
      speed: isSet(object.speed) ? Number(object.speed) : 0,
      duration: isSet(object.duration) ? Number(object.duration) : 0,
    };
  },

  toJSON(message: Command_StartShake): unknown {
    const obj: any = {};
    message.speed !== undefined && (obj.speed = Math.round(message.speed));
    message.duration !== undefined && (obj.duration = Math.round(message.duration));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_StartShake>, I>>(base?: I): Command_StartShake {
    return Command_StartShake.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_StartShake>, I>>(object: I): Command_StartShake {
    const message = createBaseCommand_StartShake();
    message.speed = object.speed ?? 0;
    message.duration = object.duration ?? 0;
    return message;
  },
};

function createBaseCommand_StopShake(): Command_StopShake {
  return {};
}

export const Command_StopShake = {
  encode(_: Command_StopShake, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_StopShake {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_StopShake();
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

  fromJSON(_: any): Command_StopShake {
    return {};
  },

  toJSON(_: Command_StopShake): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_StopShake>, I>>(base?: I): Command_StopShake {
    return Command_StopShake.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_StopShake>, I>>(_: I): Command_StopShake {
    const message = createBaseCommand_StopShake();
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

function createBaseCommand_WaitForShakeToFinish(): Command_WaitForShakeToFinish {
  return { timeout: 0 };
}

export const Command_WaitForShakeToFinish = {
  encode(message: Command_WaitForShakeToFinish, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.timeout !== 0) {
      writer.uint32(8).int32(message.timeout);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_WaitForShakeToFinish {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_WaitForShakeToFinish();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.timeout = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_WaitForShakeToFinish {
    return { timeout: isSet(object.timeout) ? Number(object.timeout) : 0 };
  },

  toJSON(message: Command_WaitForShakeToFinish): unknown {
    const obj: any = {};
    message.timeout !== undefined && (obj.timeout = Math.round(message.timeout));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_WaitForShakeToFinish>, I>>(base?: I): Command_WaitForShakeToFinish {
    return Command_WaitForShakeToFinish.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_WaitForShakeToFinish>, I>>(object: I): Command_WaitForShakeToFinish {
    const message = createBaseCommand_WaitForShakeToFinish();
    message.timeout = object.timeout ?? 0;
    return message;
  },
};

function createBaseConfig(): Config {
  return { com_port: "", tool_id: "" };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.com_port !== "") {
      writer.uint32(10).string(message.com_port);
    }
    if (message.tool_id !== "") {
      writer.uint32(18).string(message.tool_id);
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
        case 2:
          if (tag !== 18) {
            break;
          }

          message.tool_id = reader.string();
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
      com_port: isSet(object.com_port) ? String(object.com_port) : "",
      tool_id: isSet(object.tool_id) ? String(object.tool_id) : "",
    };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.com_port !== undefined && (obj.com_port = message.com_port);
    message.tool_id !== undefined && (obj.tool_id = message.tool_id);
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.com_port = object.com_port ?? "";
    message.tool_id = object.tool_id ?? "";
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
