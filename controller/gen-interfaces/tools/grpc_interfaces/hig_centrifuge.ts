/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.hig_centrifuge";

export interface Command {
  home?: Command_Home | undefined;
  close_shield?: Command_CloseShield | undefined;
  open_shield?: Command_OpenShield | undefined;
  spin?: Command_Spin | undefined;
  home_shield?: Command_HomeShield | undefined;
}

export interface Command_Home {}

export interface Command_CloseShield {}

export interface Command_OpenShield {
  bucket_id: number;
}

export interface Command_Spin {
  speed: number;
  acceleration: number;
  decceleration: number;
  duration: number;
}

export interface Command_AbortSpin {}

export interface Command_Reset {}

export interface Command_HomeShield {}

export interface Config {
  can_port: number;
}

function createBaseCommand(): Command {
  return {
    home: undefined,
    close_shield: undefined,
    open_shield: undefined,
    spin: undefined,
    home_shield: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.home !== undefined) {
      Command_Home.encode(message.home, writer.uint32(10).fork()).ldelim();
    }
    if (message.close_shield !== undefined) {
      Command_CloseShield.encode(message.close_shield, writer.uint32(18).fork()).ldelim();
    }
    if (message.open_shield !== undefined) {
      Command_OpenShield.encode(message.open_shield, writer.uint32(26).fork()).ldelim();
    }
    if (message.spin !== undefined) {
      Command_Spin.encode(message.spin, writer.uint32(34).fork()).ldelim();
    }
    if (message.home_shield !== undefined) {
      Command_HomeShield.encode(message.home_shield, writer.uint32(42).fork()).ldelim();
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

          message.close_shield = Command_CloseShield.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.open_shield = Command_OpenShield.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.spin = Command_Spin.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.home_shield = Command_HomeShield.decode(reader, reader.uint32());
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
      close_shield: isSet(object.close_shield)
        ? Command_CloseShield.fromJSON(object.close_shield)
        : undefined,
      open_shield: isSet(object.open_shield)
        ? Command_OpenShield.fromJSON(object.open_shield)
        : undefined,
      spin: isSet(object.spin) ? Command_Spin.fromJSON(object.spin) : undefined,
      home_shield: isSet(object.home_shield)
        ? Command_HomeShield.fromJSON(object.home_shield)
        : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.home !== undefined &&
      (obj.home = message.home ? Command_Home.toJSON(message.home) : undefined);
    message.close_shield !== undefined &&
      (obj.close_shield = message.close_shield
        ? Command_CloseShield.toJSON(message.close_shield)
        : undefined);
    message.open_shield !== undefined &&
      (obj.open_shield = message.open_shield
        ? Command_OpenShield.toJSON(message.open_shield)
        : undefined);
    message.spin !== undefined &&
      (obj.spin = message.spin ? Command_Spin.toJSON(message.spin) : undefined);
    message.home_shield !== undefined &&
      (obj.home_shield = message.home_shield
        ? Command_HomeShield.toJSON(message.home_shield)
        : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.home =
      object.home !== undefined && object.home !== null
        ? Command_Home.fromPartial(object.home)
        : undefined;
    message.close_shield =
      object.close_shield !== undefined && object.close_shield !== null
        ? Command_CloseShield.fromPartial(object.close_shield)
        : undefined;
    message.open_shield =
      object.open_shield !== undefined && object.open_shield !== null
        ? Command_OpenShield.fromPartial(object.open_shield)
        : undefined;
    message.spin =
      object.spin !== undefined && object.spin !== null
        ? Command_Spin.fromPartial(object.spin)
        : undefined;
    message.home_shield =
      object.home_shield !== undefined && object.home_shield !== null
        ? Command_HomeShield.fromPartial(object.home_shield)
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

function createBaseCommand_CloseShield(): Command_CloseShield {
  return {};
}

export const Command_CloseShield = {
  encode(_: Command_CloseShield, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_CloseShield {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_CloseShield();
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

  fromJSON(_: any): Command_CloseShield {
    return {};
  },

  toJSON(_: Command_CloseShield): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_CloseShield>, I>>(base?: I): Command_CloseShield {
    return Command_CloseShield.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_CloseShield>, I>>(_: I): Command_CloseShield {
    const message = createBaseCommand_CloseShield();
    return message;
  },
};

function createBaseCommand_OpenShield(): Command_OpenShield {
  return { bucket_id: 0 };
}

export const Command_OpenShield = {
  encode(message: Command_OpenShield, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bucket_id !== 0) {
      writer.uint32(8).int32(message.bucket_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_OpenShield {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_OpenShield();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.bucket_id = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_OpenShield {
    return { bucket_id: isSet(object.bucket_id) ? Number(object.bucket_id) : 0 };
  },

  toJSON(message: Command_OpenShield): unknown {
    const obj: any = {};
    message.bucket_id !== undefined && (obj.bucket_id = Math.round(message.bucket_id));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_OpenShield>, I>>(base?: I): Command_OpenShield {
    return Command_OpenShield.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_OpenShield>, I>>(object: I): Command_OpenShield {
    const message = createBaseCommand_OpenShield();
    message.bucket_id = object.bucket_id ?? 0;
    return message;
  },
};

function createBaseCommand_Spin(): Command_Spin {
  return { speed: 0, acceleration: 0, decceleration: 0, duration: 0 };
}

export const Command_Spin = {
  encode(message: Command_Spin, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.speed !== 0) {
      writer.uint32(8).int32(message.speed);
    }
    if (message.acceleration !== 0) {
      writer.uint32(16).int32(message.acceleration);
    }
    if (message.decceleration !== 0) {
      writer.uint32(24).int32(message.decceleration);
    }
    if (message.duration !== 0) {
      writer.uint32(32).int32(message.duration);
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

          message.speed = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.acceleration = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.decceleration = reader.int32();
          continue;
        case 4:
          if (tag !== 32) {
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

  fromJSON(object: any): Command_Spin {
    return {
      speed: isSet(object.speed) ? Number(object.speed) : 0,
      acceleration: isSet(object.acceleration) ? Number(object.acceleration) : 0,
      decceleration: isSet(object.decceleration) ? Number(object.decceleration) : 0,
      duration: isSet(object.duration) ? Number(object.duration) : 0,
    };
  },

  toJSON(message: Command_Spin): unknown {
    const obj: any = {};
    message.speed !== undefined && (obj.speed = Math.round(message.speed));
    message.acceleration !== undefined && (obj.acceleration = Math.round(message.acceleration));
    message.decceleration !== undefined && (obj.decceleration = Math.round(message.decceleration));
    message.duration !== undefined && (obj.duration = Math.round(message.duration));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Spin>, I>>(base?: I): Command_Spin {
    return Command_Spin.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Spin>, I>>(object: I): Command_Spin {
    const message = createBaseCommand_Spin();
    message.speed = object.speed ?? 0;
    message.acceleration = object.acceleration ?? 0;
    message.decceleration = object.decceleration ?? 0;
    message.duration = object.duration ?? 0;
    return message;
  },
};

function createBaseCommand_AbortSpin(): Command_AbortSpin {
  return {};
}

export const Command_AbortSpin = {
  encode(_: Command_AbortSpin, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_AbortSpin {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_AbortSpin();
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

  fromJSON(_: any): Command_AbortSpin {
    return {};
  },

  toJSON(_: Command_AbortSpin): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_AbortSpin>, I>>(base?: I): Command_AbortSpin {
    return Command_AbortSpin.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_AbortSpin>, I>>(_: I): Command_AbortSpin {
    const message = createBaseCommand_AbortSpin();
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

function createBaseCommand_HomeShield(): Command_HomeShield {
  return {};
}

export const Command_HomeShield = {
  encode(_: Command_HomeShield, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_HomeShield {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_HomeShield();
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

  fromJSON(_: any): Command_HomeShield {
    return {};
  },

  toJSON(_: Command_HomeShield): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_HomeShield>, I>>(base?: I): Command_HomeShield {
    return Command_HomeShield.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_HomeShield>, I>>(_: I): Command_HomeShield {
    const message = createBaseCommand_HomeShield();
    return message;
  },
};

function createBaseConfig(): Config {
  return { can_port: 0 };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.can_port !== 0) {
      writer.uint32(8).int32(message.can_port);
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
          if (tag !== 8) {
            break;
          }

          message.can_port = reader.int32();
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
    return { can_port: isSet(object.can_port) ? Number(object.can_port) : 0 };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.can_port !== undefined && (obj.can_port = Math.round(message.can_port));
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.can_port = object.can_port ?? 0;
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
