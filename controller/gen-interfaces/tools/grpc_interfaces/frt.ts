/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.tgrpc_interfacesools.frt";

export interface Command {
  move_plate?: Command_MovePlate | undefined;
}

export interface Command_MovePlate {
}

export interface Config {
}

function createBaseCommand(): Command {
  return { move_plate: undefined };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.move_plate !== undefined) {
      Command_MovePlate.encode(message.move_plate, writer.uint32(10).fork()).ldelim();
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

          message.move_plate = Command_MovePlate.decode(reader, reader.uint32());
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
    return { move_plate: isSet(object.move_plate) ? Command_MovePlate.fromJSON(object.move_plate) : undefined };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.move_plate !== undefined &&
      (obj.move_plate = message.move_plate ? Command_MovePlate.toJSON(message.move_plate) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.move_plate = (object.move_plate !== undefined && object.move_plate !== null)
      ? Command_MovePlate.fromPartial(object.move_plate)
      : undefined;
    return message;
  },
};

function createBaseCommand_MovePlate(): Command_MovePlate {
  return {};
}

export const Command_MovePlate = {
  encode(_: Command_MovePlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_MovePlate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_MovePlate();
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

  fromJSON(_: any): Command_MovePlate {
    return {};
  },

  toJSON(_: Command_MovePlate): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_MovePlate>, I>>(base?: I): Command_MovePlate {
    return Command_MovePlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_MovePlate>, I>>(_: I): Command_MovePlate {
    const message = createBaseCommand_MovePlate();
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
