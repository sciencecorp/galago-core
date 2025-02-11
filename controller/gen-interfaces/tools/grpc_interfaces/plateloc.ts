/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.plateloc";

export interface Command {
  seal?: Command_Seal | undefined;
  set_temperature?: Command_SetTemperature | undefined;
  set_seal_time?: Command_SetSealTime | undefined;
  get_actual_temperature?: Command_GetActualTemperature | undefined;
  stage_in?: Command_StageIn | undefined;
  stage_out?: Command_StageOut | undefined;
  show_diagnostics?: Command_ShowDiagsDialog | undefined;
}

export interface Command_Seal {}

export interface Command_SetTemperature {
  temperature: number;
}

export interface Command_SetSealTime {
  time: number;
}

export interface Command_GetActualTemperature {}

export interface Command_StageIn {}

export interface Command_StageOut {}

export interface Command_ShowDiagsDialog {}

export interface Config {
  profile: string;
}

function createBaseCommand(): Command {
  return {
    seal: undefined,
    set_temperature: undefined,
    set_seal_time: undefined,
    get_actual_temperature: undefined,
    stage_in: undefined,
    stage_out: undefined,
    show_diagnostics: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.seal !== undefined) {
      Command_Seal.encode(message.seal, writer.uint32(10).fork()).ldelim();
    }
    if (message.set_temperature !== undefined) {
      Command_SetTemperature.encode(message.set_temperature, writer.uint32(18).fork()).ldelim();
    }
    if (message.set_seal_time !== undefined) {
      Command_SetSealTime.encode(message.set_seal_time, writer.uint32(26).fork()).ldelim();
    }
    if (message.get_actual_temperature !== undefined) {
      Command_GetActualTemperature.encode(
        message.get_actual_temperature,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.stage_in !== undefined) {
      Command_StageIn.encode(message.stage_in, writer.uint32(42).fork()).ldelim();
    }
    if (message.stage_out !== undefined) {
      Command_StageOut.encode(message.stage_out, writer.uint32(50).fork()).ldelim();
    }
    if (message.show_diagnostics !== undefined) {
      Command_ShowDiagsDialog.encode(message.show_diagnostics, writer.uint32(58).fork()).ldelim();
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

          message.seal = Command_Seal.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.set_temperature = Command_SetTemperature.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.set_seal_time = Command_SetSealTime.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.get_actual_temperature = Command_GetActualTemperature.decode(
            reader,
            reader.uint32(),
          );
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.stage_in = Command_StageIn.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.stage_out = Command_StageOut.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.show_diagnostics = Command_ShowDiagsDialog.decode(reader, reader.uint32());
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
      seal: isSet(object.seal) ? Command_Seal.fromJSON(object.seal) : undefined,
      set_temperature: isSet(object.set_temperature)
        ? Command_SetTemperature.fromJSON(object.set_temperature)
        : undefined,
      set_seal_time: isSet(object.set_seal_time)
        ? Command_SetSealTime.fromJSON(object.set_seal_time)
        : undefined,
      get_actual_temperature: isSet(object.get_actual_temperature)
        ? Command_GetActualTemperature.fromJSON(object.get_actual_temperature)
        : undefined,
      stage_in: isSet(object.stage_in) ? Command_StageIn.fromJSON(object.stage_in) : undefined,
      stage_out: isSet(object.stage_out) ? Command_StageOut.fromJSON(object.stage_out) : undefined,
      show_diagnostics: isSet(object.show_diagnostics)
        ? Command_ShowDiagsDialog.fromJSON(object.show_diagnostics)
        : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.seal !== undefined &&
      (obj.seal = message.seal ? Command_Seal.toJSON(message.seal) : undefined);
    message.set_temperature !== undefined &&
      (obj.set_temperature = message.set_temperature
        ? Command_SetTemperature.toJSON(message.set_temperature)
        : undefined);
    message.set_seal_time !== undefined &&
      (obj.set_seal_time = message.set_seal_time
        ? Command_SetSealTime.toJSON(message.set_seal_time)
        : undefined);
    message.get_actual_temperature !== undefined &&
      (obj.get_actual_temperature = message.get_actual_temperature
        ? Command_GetActualTemperature.toJSON(message.get_actual_temperature)
        : undefined);
    message.stage_in !== undefined &&
      (obj.stage_in = message.stage_in ? Command_StageIn.toJSON(message.stage_in) : undefined);
    message.stage_out !== undefined &&
      (obj.stage_out = message.stage_out ? Command_StageOut.toJSON(message.stage_out) : undefined);
    message.show_diagnostics !== undefined &&
      (obj.show_diagnostics = message.show_diagnostics
        ? Command_ShowDiagsDialog.toJSON(message.show_diagnostics)
        : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.seal =
      object.seal !== undefined && object.seal !== null
        ? Command_Seal.fromPartial(object.seal)
        : undefined;
    message.set_temperature =
      object.set_temperature !== undefined && object.set_temperature !== null
        ? Command_SetTemperature.fromPartial(object.set_temperature)
        : undefined;
    message.set_seal_time =
      object.set_seal_time !== undefined && object.set_seal_time !== null
        ? Command_SetSealTime.fromPartial(object.set_seal_time)
        : undefined;
    message.get_actual_temperature =
      object.get_actual_temperature !== undefined && object.get_actual_temperature !== null
        ? Command_GetActualTemperature.fromPartial(object.get_actual_temperature)
        : undefined;
    message.stage_in =
      object.stage_in !== undefined && object.stage_in !== null
        ? Command_StageIn.fromPartial(object.stage_in)
        : undefined;
    message.stage_out =
      object.stage_out !== undefined && object.stage_out !== null
        ? Command_StageOut.fromPartial(object.stage_out)
        : undefined;
    message.show_diagnostics =
      object.show_diagnostics !== undefined && object.show_diagnostics !== null
        ? Command_ShowDiagsDialog.fromPartial(object.show_diagnostics)
        : undefined;
    return message;
  },
};

function createBaseCommand_Seal(): Command_Seal {
  return {};
}

export const Command_Seal = {
  encode(_: Command_Seal, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Seal {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Seal();
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

  fromJSON(_: any): Command_Seal {
    return {};
  },

  toJSON(_: Command_Seal): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Seal>, I>>(base?: I): Command_Seal {
    return Command_Seal.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Seal>, I>>(_: I): Command_Seal {
    const message = createBaseCommand_Seal();
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

  create<I extends Exact<DeepPartial<Command_SetTemperature>, I>>(
    base?: I,
  ): Command_SetTemperature {
    return Command_SetTemperature.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SetTemperature>, I>>(
    object: I,
  ): Command_SetTemperature {
    const message = createBaseCommand_SetTemperature();
    message.temperature = object.temperature ?? 0;
    return message;
  },
};

function createBaseCommand_SetSealTime(): Command_SetSealTime {
  return { time: 0 };
}

export const Command_SetSealTime = {
  encode(message: Command_SetSealTime, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.time !== 0) {
      writer.uint32(8).int32(message.time);
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

          message.time = reader.int32();
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
    return { time: isSet(object.time) ? Number(object.time) : 0 };
  },

  toJSON(message: Command_SetSealTime): unknown {
    const obj: any = {};
    message.time !== undefined && (obj.time = Math.round(message.time));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SetSealTime>, I>>(base?: I): Command_SetSealTime {
    return Command_SetSealTime.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SetSealTime>, I>>(
    object: I,
  ): Command_SetSealTime {
    const message = createBaseCommand_SetSealTime();
    message.time = object.time ?? 0;
    return message;
  },
};

function createBaseCommand_GetActualTemperature(): Command_GetActualTemperature {
  return {};
}

export const Command_GetActualTemperature = {
  encode(_: Command_GetActualTemperature, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetActualTemperature {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetActualTemperature();
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

  fromJSON(_: any): Command_GetActualTemperature {
    return {};
  },

  toJSON(_: Command_GetActualTemperature): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetActualTemperature>, I>>(
    base?: I,
  ): Command_GetActualTemperature {
    return Command_GetActualTemperature.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetActualTemperature>, I>>(
    _: I,
  ): Command_GetActualTemperature {
    const message = createBaseCommand_GetActualTemperature();
    return message;
  },
};

function createBaseCommand_StageIn(): Command_StageIn {
  return {};
}

export const Command_StageIn = {
  encode(_: Command_StageIn, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_StageIn {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_StageIn();
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

  fromJSON(_: any): Command_StageIn {
    return {};
  },

  toJSON(_: Command_StageIn): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_StageIn>, I>>(base?: I): Command_StageIn {
    return Command_StageIn.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_StageIn>, I>>(_: I): Command_StageIn {
    const message = createBaseCommand_StageIn();
    return message;
  },
};

function createBaseCommand_StageOut(): Command_StageOut {
  return {};
}

export const Command_StageOut = {
  encode(_: Command_StageOut, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_StageOut {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_StageOut();
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

  fromJSON(_: any): Command_StageOut {
    return {};
  },

  toJSON(_: Command_StageOut): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_StageOut>, I>>(base?: I): Command_StageOut {
    return Command_StageOut.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_StageOut>, I>>(_: I): Command_StageOut {
    const message = createBaseCommand_StageOut();
    return message;
  },
};

function createBaseCommand_ShowDiagsDialog(): Command_ShowDiagsDialog {
  return {};
}

export const Command_ShowDiagsDialog = {
  encode(_: Command_ShowDiagsDialog, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_ShowDiagsDialog {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_ShowDiagsDialog();
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

  fromJSON(_: any): Command_ShowDiagsDialog {
    return {};
  },

  toJSON(_: Command_ShowDiagsDialog): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_ShowDiagsDialog>, I>>(
    base?: I,
  ): Command_ShowDiagsDialog {
    return Command_ShowDiagsDialog.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ShowDiagsDialog>, I>>(
    _: I,
  ): Command_ShowDiagsDialog {
    const message = createBaseCommand_ShowDiagsDialog();
    return message;
  },
};

function createBaseConfig(): Config {
  return { profile: "" };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.profile !== "") {
      writer.uint32(10).string(message.profile);
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
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Config {
    return { profile: isSet(object.profile) ? String(object.profile) : "" };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.profile !== undefined && (obj.profile = message.profile);
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.profile = object.profile ?? "";
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
