/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.vcode";

export interface Command {
  home?: Command_Home | undefined;
  print?: Command_Print | undefined;
  print_and_apply?: Command_PrintAndApply | undefined;
  rotate_180?: Command_Rotate180 | undefined;
  rotate_stage?: Command_RotateStage | undefined;
  show_diagnostics?: Command_ShowDiagsDialog | undefined;
}

export interface Command_RotateStage {
  angle: number;
}

export interface Command_Home {
}

export interface Command_PrintAndApply {
  format_name: string;
  side: string;
  drop_stage: boolean;
  field_0: string;
  field_1: string;
  field_2: string;
  field_3: string;
  field_4: string;
  field_5: string;
}

export interface Command_DropStage {
  drop_stage: boolean;
}

export interface Command_Print {
  format_name: string;
  field_0: string;
  field_1: string;
  field_2: string;
  field_3: string;
  field_4: string;
  field_5: string;
}

export interface Command_Rotate180 {
}

export interface Command_ShowDiagsDialog {
}

export interface Config {
  profile: string;
}

function createBaseCommand(): Command {
  return {
    home: undefined,
    print: undefined,
    print_and_apply: undefined,
    rotate_180: undefined,
    rotate_stage: undefined,
    show_diagnostics: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.home !== undefined) {
      Command_Home.encode(message.home, writer.uint32(10).fork()).ldelim();
    }
    if (message.print !== undefined) {
      Command_Print.encode(message.print, writer.uint32(18).fork()).ldelim();
    }
    if (message.print_and_apply !== undefined) {
      Command_PrintAndApply.encode(message.print_and_apply, writer.uint32(26).fork()).ldelim();
    }
    if (message.rotate_180 !== undefined) {
      Command_Rotate180.encode(message.rotate_180, writer.uint32(34).fork()).ldelim();
    }
    if (message.rotate_stage !== undefined) {
      Command_RotateStage.encode(message.rotate_stage, writer.uint32(42).fork()).ldelim();
    }
    if (message.show_diagnostics !== undefined) {
      Command_ShowDiagsDialog.encode(message.show_diagnostics, writer.uint32(50).fork()).ldelim();
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

          message.print = Command_Print.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.print_and_apply = Command_PrintAndApply.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.rotate_180 = Command_Rotate180.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.rotate_stage = Command_RotateStage.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
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
      home: isSet(object.home) ? Command_Home.fromJSON(object.home) : undefined,
      print: isSet(object.print) ? Command_Print.fromJSON(object.print) : undefined,
      print_and_apply: isSet(object.print_and_apply)
        ? Command_PrintAndApply.fromJSON(object.print_and_apply)
        : undefined,
      rotate_180: isSet(object.rotate_180) ? Command_Rotate180.fromJSON(object.rotate_180) : undefined,
      rotate_stage: isSet(object.rotate_stage) ? Command_RotateStage.fromJSON(object.rotate_stage) : undefined,
      show_diagnostics: isSet(object.show_diagnostics)
        ? Command_ShowDiagsDialog.fromJSON(object.show_diagnostics)
        : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.home !== undefined && (obj.home = message.home ? Command_Home.toJSON(message.home) : undefined);
    message.print !== undefined && (obj.print = message.print ? Command_Print.toJSON(message.print) : undefined);
    message.print_and_apply !== undefined &&
      (obj.print_and_apply = message.print_and_apply
        ? Command_PrintAndApply.toJSON(message.print_and_apply)
        : undefined);
    message.rotate_180 !== undefined &&
      (obj.rotate_180 = message.rotate_180 ? Command_Rotate180.toJSON(message.rotate_180) : undefined);
    message.rotate_stage !== undefined &&
      (obj.rotate_stage = message.rotate_stage ? Command_RotateStage.toJSON(message.rotate_stage) : undefined);
    message.show_diagnostics !== undefined && (obj.show_diagnostics = message.show_diagnostics
      ? Command_ShowDiagsDialog.toJSON(message.show_diagnostics)
      : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.home = (object.home !== undefined && object.home !== null)
      ? Command_Home.fromPartial(object.home)
      : undefined;
    message.print = (object.print !== undefined && object.print !== null)
      ? Command_Print.fromPartial(object.print)
      : undefined;
    message.print_and_apply = (object.print_and_apply !== undefined && object.print_and_apply !== null)
      ? Command_PrintAndApply.fromPartial(object.print_and_apply)
      : undefined;
    message.rotate_180 = (object.rotate_180 !== undefined && object.rotate_180 !== null)
      ? Command_Rotate180.fromPartial(object.rotate_180)
      : undefined;
    message.rotate_stage = (object.rotate_stage !== undefined && object.rotate_stage !== null)
      ? Command_RotateStage.fromPartial(object.rotate_stage)
      : undefined;
    message.show_diagnostics = (object.show_diagnostics !== undefined && object.show_diagnostics !== null)
      ? Command_ShowDiagsDialog.fromPartial(object.show_diagnostics)
      : undefined;
    return message;
  },
};

function createBaseCommand_RotateStage(): Command_RotateStage {
  return { angle: 0 };
}

export const Command_RotateStage = {
  encode(message: Command_RotateStage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.angle !== 0) {
      writer.uint32(8).int32(message.angle);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_RotateStage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_RotateStage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.angle = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_RotateStage {
    return { angle: isSet(object.angle) ? Number(object.angle) : 0 };
  },

  toJSON(message: Command_RotateStage): unknown {
    const obj: any = {};
    message.angle !== undefined && (obj.angle = Math.round(message.angle));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RotateStage>, I>>(base?: I): Command_RotateStage {
    return Command_RotateStage.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RotateStage>, I>>(object: I): Command_RotateStage {
    const message = createBaseCommand_RotateStage();
    message.angle = object.angle ?? 0;
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

function createBaseCommand_PrintAndApply(): Command_PrintAndApply {
  return {
    format_name: "",
    side: "",
    drop_stage: false,
    field_0: "",
    field_1: "",
    field_2: "",
    field_3: "",
    field_4: "",
    field_5: "",
  };
}

export const Command_PrintAndApply = {
  encode(message: Command_PrintAndApply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.format_name !== "") {
      writer.uint32(10).string(message.format_name);
    }
    if (message.side !== "") {
      writer.uint32(18).string(message.side);
    }
    if (message.drop_stage === true) {
      writer.uint32(24).bool(message.drop_stage);
    }
    if (message.field_0 !== "") {
      writer.uint32(34).string(message.field_0);
    }
    if (message.field_1 !== "") {
      writer.uint32(42).string(message.field_1);
    }
    if (message.field_2 !== "") {
      writer.uint32(50).string(message.field_2);
    }
    if (message.field_3 !== "") {
      writer.uint32(58).string(message.field_3);
    }
    if (message.field_4 !== "") {
      writer.uint32(66).string(message.field_4);
    }
    if (message.field_5 !== "") {
      writer.uint32(74).string(message.field_5);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_PrintAndApply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_PrintAndApply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.format_name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.side = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.drop_stage = reader.bool();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.field_0 = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.field_1 = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.field_2 = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.field_3 = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.field_4 = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.field_5 = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_PrintAndApply {
    return {
      format_name: isSet(object.format_name) ? String(object.format_name) : "",
      side: isSet(object.side) ? String(object.side) : "",
      drop_stage: isSet(object.drop_stage) ? Boolean(object.drop_stage) : false,
      field_0: isSet(object.field_0) ? String(object.field_0) : "",
      field_1: isSet(object.field_1) ? String(object.field_1) : "",
      field_2: isSet(object.field_2) ? String(object.field_2) : "",
      field_3: isSet(object.field_3) ? String(object.field_3) : "",
      field_4: isSet(object.field_4) ? String(object.field_4) : "",
      field_5: isSet(object.field_5) ? String(object.field_5) : "",
    };
  },

  toJSON(message: Command_PrintAndApply): unknown {
    const obj: any = {};
    message.format_name !== undefined && (obj.format_name = message.format_name);
    message.side !== undefined && (obj.side = message.side);
    message.drop_stage !== undefined && (obj.drop_stage = message.drop_stage);
    message.field_0 !== undefined && (obj.field_0 = message.field_0);
    message.field_1 !== undefined && (obj.field_1 = message.field_1);
    message.field_2 !== undefined && (obj.field_2 = message.field_2);
    message.field_3 !== undefined && (obj.field_3 = message.field_3);
    message.field_4 !== undefined && (obj.field_4 = message.field_4);
    message.field_5 !== undefined && (obj.field_5 = message.field_5);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_PrintAndApply>, I>>(base?: I): Command_PrintAndApply {
    return Command_PrintAndApply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_PrintAndApply>, I>>(object: I): Command_PrintAndApply {
    const message = createBaseCommand_PrintAndApply();
    message.format_name = object.format_name ?? "";
    message.side = object.side ?? "";
    message.drop_stage = object.drop_stage ?? false;
    message.field_0 = object.field_0 ?? "";
    message.field_1 = object.field_1 ?? "";
    message.field_2 = object.field_2 ?? "";
    message.field_3 = object.field_3 ?? "";
    message.field_4 = object.field_4 ?? "";
    message.field_5 = object.field_5 ?? "";
    return message;
  },
};

function createBaseCommand_DropStage(): Command_DropStage {
  return { drop_stage: false };
}

export const Command_DropStage = {
  encode(message: Command_DropStage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.drop_stage === true) {
      writer.uint32(8).bool(message.drop_stage);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_DropStage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_DropStage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.drop_stage = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_DropStage {
    return { drop_stage: isSet(object.drop_stage) ? Boolean(object.drop_stage) : false };
  },

  toJSON(message: Command_DropStage): unknown {
    const obj: any = {};
    message.drop_stage !== undefined && (obj.drop_stage = message.drop_stage);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_DropStage>, I>>(base?: I): Command_DropStage {
    return Command_DropStage.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_DropStage>, I>>(object: I): Command_DropStage {
    const message = createBaseCommand_DropStage();
    message.drop_stage = object.drop_stage ?? false;
    return message;
  },
};

function createBaseCommand_Print(): Command_Print {
  return { format_name: "", field_0: "", field_1: "", field_2: "", field_3: "", field_4: "", field_5: "" };
}

export const Command_Print = {
  encode(message: Command_Print, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.format_name !== "") {
      writer.uint32(10).string(message.format_name);
    }
    if (message.field_0 !== "") {
      writer.uint32(18).string(message.field_0);
    }
    if (message.field_1 !== "") {
      writer.uint32(26).string(message.field_1);
    }
    if (message.field_2 !== "") {
      writer.uint32(34).string(message.field_2);
    }
    if (message.field_3 !== "") {
      writer.uint32(42).string(message.field_3);
    }
    if (message.field_4 !== "") {
      writer.uint32(50).string(message.field_4);
    }
    if (message.field_5 !== "") {
      writer.uint32(58).string(message.field_5);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Print {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Print();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.format_name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.field_0 = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.field_1 = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.field_2 = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.field_3 = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.field_4 = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.field_5 = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Print {
    return {
      format_name: isSet(object.format_name) ? String(object.format_name) : "",
      field_0: isSet(object.field_0) ? String(object.field_0) : "",
      field_1: isSet(object.field_1) ? String(object.field_1) : "",
      field_2: isSet(object.field_2) ? String(object.field_2) : "",
      field_3: isSet(object.field_3) ? String(object.field_3) : "",
      field_4: isSet(object.field_4) ? String(object.field_4) : "",
      field_5: isSet(object.field_5) ? String(object.field_5) : "",
    };
  },

  toJSON(message: Command_Print): unknown {
    const obj: any = {};
    message.format_name !== undefined && (obj.format_name = message.format_name);
    message.field_0 !== undefined && (obj.field_0 = message.field_0);
    message.field_1 !== undefined && (obj.field_1 = message.field_1);
    message.field_2 !== undefined && (obj.field_2 = message.field_2);
    message.field_3 !== undefined && (obj.field_3 = message.field_3);
    message.field_4 !== undefined && (obj.field_4 = message.field_4);
    message.field_5 !== undefined && (obj.field_5 = message.field_5);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Print>, I>>(base?: I): Command_Print {
    return Command_Print.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Print>, I>>(object: I): Command_Print {
    const message = createBaseCommand_Print();
    message.format_name = object.format_name ?? "";
    message.field_0 = object.field_0 ?? "";
    message.field_1 = object.field_1 ?? "";
    message.field_2 = object.field_2 ?? "";
    message.field_3 = object.field_3 ?? "";
    message.field_4 = object.field_4 ?? "";
    message.field_5 = object.field_5 ?? "";
    return message;
  },
};

function createBaseCommand_Rotate180(): Command_Rotate180 {
  return {};
}

export const Command_Rotate180 = {
  encode(_: Command_Rotate180, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Rotate180 {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Rotate180();
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

  fromJSON(_: any): Command_Rotate180 {
    return {};
  },

  toJSON(_: Command_Rotate180): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Rotate180>, I>>(base?: I): Command_Rotate180 {
    return Command_Rotate180.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Rotate180>, I>>(_: I): Command_Rotate180 {
    const message = createBaseCommand_Rotate180();
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

  create<I extends Exact<DeepPartial<Command_ShowDiagsDialog>, I>>(base?: I): Command_ShowDiagsDialog {
    return Command_ShowDiagsDialog.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ShowDiagsDialog>, I>>(_: I): Command_ShowDiagsDialog {
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
