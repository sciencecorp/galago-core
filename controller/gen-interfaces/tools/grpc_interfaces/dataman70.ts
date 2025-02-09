/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.dataman70";

export interface Command {
  reset?: Command_Reset | undefined;
  assert_barcode?: Command_AssertBarcode | undefined;
}

export interface Command_Reset {
}

export interface Command_AssertBarcode {
  barcode: string;
}

export interface Config {
  com_port: string;
}

function createBaseCommand(): Command {
  return { reset: undefined, assert_barcode: undefined };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.reset !== undefined) {
      Command_Reset.encode(message.reset, writer.uint32(10).fork()).ldelim();
    }
    if (message.assert_barcode !== undefined) {
      Command_AssertBarcode.encode(message.assert_barcode, writer.uint32(18).fork()).ldelim();
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

          message.reset = Command_Reset.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.assert_barcode = Command_AssertBarcode.decode(reader, reader.uint32());
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
      reset: isSet(object.reset) ? Command_Reset.fromJSON(object.reset) : undefined,
      assert_barcode: isSet(object.assert_barcode) ? Command_AssertBarcode.fromJSON(object.assert_barcode) : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.reset !== undefined && (obj.reset = message.reset ? Command_Reset.toJSON(message.reset) : undefined);
    message.assert_barcode !== undefined &&
      (obj.assert_barcode = message.assert_barcode ? Command_AssertBarcode.toJSON(message.assert_barcode) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.reset = (object.reset !== undefined && object.reset !== null)
      ? Command_Reset.fromPartial(object.reset)
      : undefined;
    message.assert_barcode = (object.assert_barcode !== undefined && object.assert_barcode !== null)
      ? Command_AssertBarcode.fromPartial(object.assert_barcode)
      : undefined;
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

function createBaseCommand_AssertBarcode(): Command_AssertBarcode {
  return { barcode: "" };
}

export const Command_AssertBarcode = {
  encode(message: Command_AssertBarcode, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.barcode !== "") {
      writer.uint32(10).string(message.barcode);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_AssertBarcode {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_AssertBarcode();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.barcode = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_AssertBarcode {
    return { barcode: isSet(object.barcode) ? String(object.barcode) : "" };
  },

  toJSON(message: Command_AssertBarcode): unknown {
    const obj: any = {};
    message.barcode !== undefined && (obj.barcode = message.barcode);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_AssertBarcode>, I>>(base?: I): Command_AssertBarcode {
    return Command_AssertBarcode.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_AssertBarcode>, I>>(object: I): Command_AssertBarcode {
    const message = createBaseCommand_AssertBarcode();
    message.barcode = object.barcode ?? "";
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
