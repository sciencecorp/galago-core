/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.alps3000";

export interface Command {
  get_status?: Command_GetInstrumentStatus | undefined;
  seal_plate?: Command_SealPlate | undefined;
  get_error?: Command_GetError | undefined;
  set_temperature?: Command_SetTemperature | undefined;
  set_sealing_time?: Command_SetSealTime | undefined;
  get_sealing_temperature_setpoint?: Command_GetTemperatureSetpoint | undefined;
  get_sealing_time?: Command_SetSealTime | undefined;
  get_sealing_temperature_actual?: Command_GetTemperatureActual | undefined;
}

export interface Command_SetTemperature {
  temperature: number;
}

export interface Command_SetSealTime {
  seal_time: number;
}

export interface Command_GetInstrumentStatus {
}

export interface Command_SealPlate {
}

export interface Command_GetError {
}

export interface Command_GetTemperatureActual {
}

export interface Command_GetSealingTime {
}

export interface Command_GetTemperatureSetpoint {
}

export interface Config {
  profile: string;
  com_port: string;
}

function createBaseCommand(): Command {
  return {
    get_status: undefined,
    seal_plate: undefined,
    get_error: undefined,
    set_temperature: undefined,
    set_sealing_time: undefined,
    get_sealing_temperature_setpoint: undefined,
    get_sealing_time: undefined,
    get_sealing_temperature_actual: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.get_status !== undefined) {
      Command_GetInstrumentStatus.encode(message.get_status, writer.uint32(10).fork()).ldelim();
    }
    if (message.seal_plate !== undefined) {
      Command_SealPlate.encode(message.seal_plate, writer.uint32(18).fork()).ldelim();
    }
    if (message.get_error !== undefined) {
      Command_GetError.encode(message.get_error, writer.uint32(26).fork()).ldelim();
    }
    if (message.set_temperature !== undefined) {
      Command_SetTemperature.encode(message.set_temperature, writer.uint32(34).fork()).ldelim();
    }
    if (message.set_sealing_time !== undefined) {
      Command_SetSealTime.encode(message.set_sealing_time, writer.uint32(42).fork()).ldelim();
    }
    if (message.get_sealing_temperature_setpoint !== undefined) {
      Command_GetTemperatureSetpoint.encode(message.get_sealing_temperature_setpoint, writer.uint32(50).fork())
        .ldelim();
    }
    if (message.get_sealing_time !== undefined) {
      Command_SetSealTime.encode(message.get_sealing_time, writer.uint32(58).fork()).ldelim();
    }
    if (message.get_sealing_temperature_actual !== undefined) {
      Command_GetTemperatureActual.encode(message.get_sealing_temperature_actual, writer.uint32(66).fork()).ldelim();
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

          message.get_status = Command_GetInstrumentStatus.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.seal_plate = Command_SealPlate.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.get_error = Command_GetError.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.set_temperature = Command_SetTemperature.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.set_sealing_time = Command_SetSealTime.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.get_sealing_temperature_setpoint = Command_GetTemperatureSetpoint.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.get_sealing_time = Command_SetSealTime.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.get_sealing_temperature_actual = Command_GetTemperatureActual.decode(reader, reader.uint32());
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
      get_status: isSet(object.get_status) ? Command_GetInstrumentStatus.fromJSON(object.get_status) : undefined,
      seal_plate: isSet(object.seal_plate) ? Command_SealPlate.fromJSON(object.seal_plate) : undefined,
      get_error: isSet(object.get_error) ? Command_GetError.fromJSON(object.get_error) : undefined,
      set_temperature: isSet(object.set_temperature)
        ? Command_SetTemperature.fromJSON(object.set_temperature)
        : undefined,
      set_sealing_time: isSet(object.set_sealing_time)
        ? Command_SetSealTime.fromJSON(object.set_sealing_time)
        : undefined,
      get_sealing_temperature_setpoint: isSet(object.get_sealing_temperature_setpoint)
        ? Command_GetTemperatureSetpoint.fromJSON(object.get_sealing_temperature_setpoint)
        : undefined,
      get_sealing_time: isSet(object.get_sealing_time)
        ? Command_SetSealTime.fromJSON(object.get_sealing_time)
        : undefined,
      get_sealing_temperature_actual: isSet(object.get_sealing_temperature_actual)
        ? Command_GetTemperatureActual.fromJSON(object.get_sealing_temperature_actual)
        : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.get_status !== undefined &&
      (obj.get_status = message.get_status ? Command_GetInstrumentStatus.toJSON(message.get_status) : undefined);
    message.seal_plate !== undefined &&
      (obj.seal_plate = message.seal_plate ? Command_SealPlate.toJSON(message.seal_plate) : undefined);
    message.get_error !== undefined &&
      (obj.get_error = message.get_error ? Command_GetError.toJSON(message.get_error) : undefined);
    message.set_temperature !== undefined && (obj.set_temperature = message.set_temperature
      ? Command_SetTemperature.toJSON(message.set_temperature)
      : undefined);
    message.set_sealing_time !== undefined && (obj.set_sealing_time = message.set_sealing_time
      ? Command_SetSealTime.toJSON(message.set_sealing_time)
      : undefined);
    message.get_sealing_temperature_setpoint !== undefined &&
      (obj.get_sealing_temperature_setpoint = message.get_sealing_temperature_setpoint
        ? Command_GetTemperatureSetpoint.toJSON(message.get_sealing_temperature_setpoint)
        : undefined);
    message.get_sealing_time !== undefined && (obj.get_sealing_time = message.get_sealing_time
      ? Command_SetSealTime.toJSON(message.get_sealing_time)
      : undefined);
    message.get_sealing_temperature_actual !== undefined &&
      (obj.get_sealing_temperature_actual = message.get_sealing_temperature_actual
        ? Command_GetTemperatureActual.toJSON(message.get_sealing_temperature_actual)
        : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.get_status = (object.get_status !== undefined && object.get_status !== null)
      ? Command_GetInstrumentStatus.fromPartial(object.get_status)
      : undefined;
    message.seal_plate = (object.seal_plate !== undefined && object.seal_plate !== null)
      ? Command_SealPlate.fromPartial(object.seal_plate)
      : undefined;
    message.get_error = (object.get_error !== undefined && object.get_error !== null)
      ? Command_GetError.fromPartial(object.get_error)
      : undefined;
    message.set_temperature = (object.set_temperature !== undefined && object.set_temperature !== null)
      ? Command_SetTemperature.fromPartial(object.set_temperature)
      : undefined;
    message.set_sealing_time = (object.set_sealing_time !== undefined && object.set_sealing_time !== null)
      ? Command_SetSealTime.fromPartial(object.set_sealing_time)
      : undefined;
    message.get_sealing_temperature_setpoint =
      (object.get_sealing_temperature_setpoint !== undefined && object.get_sealing_temperature_setpoint !== null)
        ? Command_GetTemperatureSetpoint.fromPartial(object.get_sealing_temperature_setpoint)
        : undefined;
    message.get_sealing_time = (object.get_sealing_time !== undefined && object.get_sealing_time !== null)
      ? Command_SetSealTime.fromPartial(object.get_sealing_time)
      : undefined;
    message.get_sealing_temperature_actual =
      (object.get_sealing_temperature_actual !== undefined && object.get_sealing_temperature_actual !== null)
        ? Command_GetTemperatureActual.fromPartial(object.get_sealing_temperature_actual)
        : undefined;
    return message;
  },
};

function createBaseCommand_SetTemperature(): Command_SetTemperature {
  return { temperature: 0 };
}

export const Command_SetTemperature = {
  encode(message: Command_SetTemperature, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.temperature !== 0) {
      writer.uint32(8).int32(message.temperature);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SetTemperature {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SetTemperature();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.temperature = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_SetTemperature {
    return { temperature: isSet(object.temperature) ? Number(object.temperature) : 0 };
  },

  toJSON(message: Command_SetTemperature): unknown {
    const obj: any = {};
    message.temperature !== undefined && (obj.temperature = Math.round(message.temperature));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SetTemperature>, I>>(base?: I): Command_SetTemperature {
    return Command_SetTemperature.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SetTemperature>, I>>(object: I): Command_SetTemperature {
    const message = createBaseCommand_SetTemperature();
    message.temperature = object.temperature ?? 0;
    return message;
  },
};

function createBaseCommand_SetSealTime(): Command_SetSealTime {
  return { seal_time: 0 };
}

export const Command_SetSealTime = {
  encode(message: Command_SetSealTime, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.seal_time !== 0) {
      writer.uint32(8).int32(message.seal_time);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SetSealTime {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SetSealTime();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.seal_time = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_SetSealTime {
    return { seal_time: isSet(object.seal_time) ? Number(object.seal_time) : 0 };
  },

  toJSON(message: Command_SetSealTime): unknown {
    const obj: any = {};
    message.seal_time !== undefined && (obj.seal_time = Math.round(message.seal_time));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SetSealTime>, I>>(base?: I): Command_SetSealTime {
    return Command_SetSealTime.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SetSealTime>, I>>(object: I): Command_SetSealTime {
    const message = createBaseCommand_SetSealTime();
    message.seal_time = object.seal_time ?? 0;
    return message;
  },
};

function createBaseCommand_GetInstrumentStatus(): Command_GetInstrumentStatus {
  return {};
}

export const Command_GetInstrumentStatus = {
  encode(_: Command_GetInstrumentStatus, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetInstrumentStatus {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetInstrumentStatus();
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

  fromJSON(_: any): Command_GetInstrumentStatus {
    return {};
  },

  toJSON(_: Command_GetInstrumentStatus): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetInstrumentStatus>, I>>(base?: I): Command_GetInstrumentStatus {
    return Command_GetInstrumentStatus.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetInstrumentStatus>, I>>(_: I): Command_GetInstrumentStatus {
    const message = createBaseCommand_GetInstrumentStatus();
    return message;
  },
};

function createBaseCommand_SealPlate(): Command_SealPlate {
  return {};
}

export const Command_SealPlate = {
  encode(_: Command_SealPlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SealPlate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SealPlate();
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

  fromJSON(_: any): Command_SealPlate {
    return {};
  },

  toJSON(_: Command_SealPlate): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SealPlate>, I>>(base?: I): Command_SealPlate {
    return Command_SealPlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SealPlate>, I>>(_: I): Command_SealPlate {
    const message = createBaseCommand_SealPlate();
    return message;
  },
};

function createBaseCommand_GetError(): Command_GetError {
  return {};
}

export const Command_GetError = {
  encode(_: Command_GetError, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetError {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetError();
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

  fromJSON(_: any): Command_GetError {
    return {};
  },

  toJSON(_: Command_GetError): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetError>, I>>(base?: I): Command_GetError {
    return Command_GetError.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetError>, I>>(_: I): Command_GetError {
    const message = createBaseCommand_GetError();
    return message;
  },
};

function createBaseCommand_GetTemperatureActual(): Command_GetTemperatureActual {
  return {};
}

export const Command_GetTemperatureActual = {
  encode(_: Command_GetTemperatureActual, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetTemperatureActual {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetTemperatureActual();
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

  fromJSON(_: any): Command_GetTemperatureActual {
    return {};
  },

  toJSON(_: Command_GetTemperatureActual): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetTemperatureActual>, I>>(base?: I): Command_GetTemperatureActual {
    return Command_GetTemperatureActual.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetTemperatureActual>, I>>(_: I): Command_GetTemperatureActual {
    const message = createBaseCommand_GetTemperatureActual();
    return message;
  },
};

function createBaseCommand_GetSealingTime(): Command_GetSealingTime {
  return {};
}

export const Command_GetSealingTime = {
  encode(_: Command_GetSealingTime, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetSealingTime {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetSealingTime();
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

  fromJSON(_: any): Command_GetSealingTime {
    return {};
  },

  toJSON(_: Command_GetSealingTime): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetSealingTime>, I>>(base?: I): Command_GetSealingTime {
    return Command_GetSealingTime.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetSealingTime>, I>>(_: I): Command_GetSealingTime {
    const message = createBaseCommand_GetSealingTime();
    return message;
  },
};

function createBaseCommand_GetTemperatureSetpoint(): Command_GetTemperatureSetpoint {
  return {};
}

export const Command_GetTemperatureSetpoint = {
  encode(_: Command_GetTemperatureSetpoint, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetTemperatureSetpoint {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetTemperatureSetpoint();
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

  fromJSON(_: any): Command_GetTemperatureSetpoint {
    return {};
  },

  toJSON(_: Command_GetTemperatureSetpoint): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetTemperatureSetpoint>, I>>(base?: I): Command_GetTemperatureSetpoint {
    return Command_GetTemperatureSetpoint.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetTemperatureSetpoint>, I>>(_: I): Command_GetTemperatureSetpoint {
    const message = createBaseCommand_GetTemperatureSetpoint();
    return message;
  },
};

function createBaseConfig(): Config {
  return { profile: "", com_port: "" };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.profile !== "") {
      writer.uint32(10).string(message.profile);
    }
    if (message.com_port !== "") {
      writer.uint32(18).string(message.com_port);
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

          message.profile = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
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
    return {
      profile: isSet(object.profile) ? String(object.profile) : "",
      com_port: isSet(object.com_port) ? String(object.com_port) : "",
    };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.profile !== undefined && (obj.profile = message.profile);
    message.com_port !== undefined && (obj.com_port = message.com_port);
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.profile = object.profile ?? "";
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
