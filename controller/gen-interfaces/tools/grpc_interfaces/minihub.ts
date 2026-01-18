/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.minihub";

export interface Command {
  abort?: Command_Abort | undefined;
  close?: Command_Close | undefined;
  disable_motor?: Command_DisableMotor | undefined;
  enable_motor?: Command_EnableMotor | undefined;
  jog?: Command_Jog | undefined;
  rotate_to_cassette?: Command_RotateToCassette | undefined;
  rotate_to_degree?: Command_RotateToDegree | undefined;
  rotate_to_home_position?: Command_RotateToHomePosition | undefined;
  set_speed?: Command_SetSpeed | undefined;
  show_diagnostics?: Command_ShowDiagsDialog | undefined;
  teach_home?: Command_TeachHome | undefined;
}

export interface Command_Abort {
}

export interface Command_Close {
}

export interface Command_DisableMotor {
}

export interface Command_EnableMotor {
}

export interface Command_Jog {
  degree: number;
  clockwise: boolean;
}

export interface Command_RotateToCassette {
  cassette_index: number;
}

export interface Command_RotateToDegree {
  degree: number;
}

export interface Command_RotateToHomePosition {
}

export interface Command_SetSpeed {
  speed: number;
}

export interface Command_ShowDiagsDialog {
}

export interface Command_TeachHome {
}

export interface Config {
  profile: string;
}

function createBaseCommand(): Command {
  return {
    abort: undefined,
    close: undefined,
    disable_motor: undefined,
    enable_motor: undefined,
    jog: undefined,
    rotate_to_cassette: undefined,
    rotate_to_degree: undefined,
    rotate_to_home_position: undefined,
    set_speed: undefined,
    show_diagnostics: undefined,
    teach_home: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.abort !== undefined) {
      Command_Abort.encode(message.abort, writer.uint32(10).fork()).ldelim();
    }
    if (message.close !== undefined) {
      Command_Close.encode(message.close, writer.uint32(18).fork()).ldelim();
    }
    if (message.disable_motor !== undefined) {
      Command_DisableMotor.encode(message.disable_motor, writer.uint32(26).fork()).ldelim();
    }
    if (message.enable_motor !== undefined) {
      Command_EnableMotor.encode(message.enable_motor, writer.uint32(34).fork()).ldelim();
    }
    if (message.jog !== undefined) {
      Command_Jog.encode(message.jog, writer.uint32(42).fork()).ldelim();
    }
    if (message.rotate_to_cassette !== undefined) {
      Command_RotateToCassette.encode(message.rotate_to_cassette, writer.uint32(50).fork()).ldelim();
    }
    if (message.rotate_to_degree !== undefined) {
      Command_RotateToDegree.encode(message.rotate_to_degree, writer.uint32(58).fork()).ldelim();
    }
    if (message.rotate_to_home_position !== undefined) {
      Command_RotateToHomePosition.encode(message.rotate_to_home_position, writer.uint32(66).fork()).ldelim();
    }
    if (message.set_speed !== undefined) {
      Command_SetSpeed.encode(message.set_speed, writer.uint32(74).fork()).ldelim();
    }
    if (message.show_diagnostics !== undefined) {
      Command_ShowDiagsDialog.encode(message.show_diagnostics, writer.uint32(82).fork()).ldelim();
    }
    if (message.teach_home !== undefined) {
      Command_TeachHome.encode(message.teach_home, writer.uint32(90).fork()).ldelim();
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

          message.abort = Command_Abort.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.close = Command_Close.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.disable_motor = Command_DisableMotor.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.enable_motor = Command_EnableMotor.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.jog = Command_Jog.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.rotate_to_cassette = Command_RotateToCassette.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.rotate_to_degree = Command_RotateToDegree.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.rotate_to_home_position = Command_RotateToHomePosition.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.set_speed = Command_SetSpeed.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.show_diagnostics = Command_ShowDiagsDialog.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.teach_home = Command_TeachHome.decode(reader, reader.uint32());
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
      abort: isSet(object.abort) ? Command_Abort.fromJSON(object.abort) : undefined,
      close: isSet(object.close) ? Command_Close.fromJSON(object.close) : undefined,
      disable_motor: isSet(object.disable_motor) ? Command_DisableMotor.fromJSON(object.disable_motor) : undefined,
      enable_motor: isSet(object.enable_motor) ? Command_EnableMotor.fromJSON(object.enable_motor) : undefined,
      jog: isSet(object.jog) ? Command_Jog.fromJSON(object.jog) : undefined,
      rotate_to_cassette: isSet(object.rotate_to_cassette)
        ? Command_RotateToCassette.fromJSON(object.rotate_to_cassette)
        : undefined,
      rotate_to_degree: isSet(object.rotate_to_degree)
        ? Command_RotateToDegree.fromJSON(object.rotate_to_degree)
        : undefined,
      rotate_to_home_position: isSet(object.rotate_to_home_position)
        ? Command_RotateToHomePosition.fromJSON(object.rotate_to_home_position)
        : undefined,
      set_speed: isSet(object.set_speed) ? Command_SetSpeed.fromJSON(object.set_speed) : undefined,
      show_diagnostics: isSet(object.show_diagnostics)
        ? Command_ShowDiagsDialog.fromJSON(object.show_diagnostics)
        : undefined,
      teach_home: isSet(object.teach_home) ? Command_TeachHome.fromJSON(object.teach_home) : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.abort !== undefined && (obj.abort = message.abort ? Command_Abort.toJSON(message.abort) : undefined);
    message.close !== undefined && (obj.close = message.close ? Command_Close.toJSON(message.close) : undefined);
    message.disable_motor !== undefined &&
      (obj.disable_motor = message.disable_motor ? Command_DisableMotor.toJSON(message.disable_motor) : undefined);
    message.enable_motor !== undefined &&
      (obj.enable_motor = message.enable_motor ? Command_EnableMotor.toJSON(message.enable_motor) : undefined);
    message.jog !== undefined && (obj.jog = message.jog ? Command_Jog.toJSON(message.jog) : undefined);
    message.rotate_to_cassette !== undefined && (obj.rotate_to_cassette = message.rotate_to_cassette
      ? Command_RotateToCassette.toJSON(message.rotate_to_cassette)
      : undefined);
    message.rotate_to_degree !== undefined && (obj.rotate_to_degree = message.rotate_to_degree
      ? Command_RotateToDegree.toJSON(message.rotate_to_degree)
      : undefined);
    message.rotate_to_home_position !== undefined && (obj.rotate_to_home_position = message.rotate_to_home_position
      ? Command_RotateToHomePosition.toJSON(message.rotate_to_home_position)
      : undefined);
    message.set_speed !== undefined &&
      (obj.set_speed = message.set_speed ? Command_SetSpeed.toJSON(message.set_speed) : undefined);
    message.show_diagnostics !== undefined && (obj.show_diagnostics = message.show_diagnostics
      ? Command_ShowDiagsDialog.toJSON(message.show_diagnostics)
      : undefined);
    message.teach_home !== undefined &&
      (obj.teach_home = message.teach_home ? Command_TeachHome.toJSON(message.teach_home) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.abort = (object.abort !== undefined && object.abort !== null)
      ? Command_Abort.fromPartial(object.abort)
      : undefined;
    message.close = (object.close !== undefined && object.close !== null)
      ? Command_Close.fromPartial(object.close)
      : undefined;
    message.disable_motor = (object.disable_motor !== undefined && object.disable_motor !== null)
      ? Command_DisableMotor.fromPartial(object.disable_motor)
      : undefined;
    message.enable_motor = (object.enable_motor !== undefined && object.enable_motor !== null)
      ? Command_EnableMotor.fromPartial(object.enable_motor)
      : undefined;
    message.jog = (object.jog !== undefined && object.jog !== null) ? Command_Jog.fromPartial(object.jog) : undefined;
    message.rotate_to_cassette = (object.rotate_to_cassette !== undefined && object.rotate_to_cassette !== null)
      ? Command_RotateToCassette.fromPartial(object.rotate_to_cassette)
      : undefined;
    message.rotate_to_degree = (object.rotate_to_degree !== undefined && object.rotate_to_degree !== null)
      ? Command_RotateToDegree.fromPartial(object.rotate_to_degree)
      : undefined;
    message.rotate_to_home_position =
      (object.rotate_to_home_position !== undefined && object.rotate_to_home_position !== null)
        ? Command_RotateToHomePosition.fromPartial(object.rotate_to_home_position)
        : undefined;
    message.set_speed = (object.set_speed !== undefined && object.set_speed !== null)
      ? Command_SetSpeed.fromPartial(object.set_speed)
      : undefined;
    message.show_diagnostics = (object.show_diagnostics !== undefined && object.show_diagnostics !== null)
      ? Command_ShowDiagsDialog.fromPartial(object.show_diagnostics)
      : undefined;
    message.teach_home = (object.teach_home !== undefined && object.teach_home !== null)
      ? Command_TeachHome.fromPartial(object.teach_home)
      : undefined;
    return message;
  },
};

function createBaseCommand_Abort(): Command_Abort {
  return {};
}

export const Command_Abort = {
  encode(_: Command_Abort, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Abort {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Abort();
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

  fromJSON(_: any): Command_Abort {
    return {};
  },

  toJSON(_: Command_Abort): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Abort>, I>>(base?: I): Command_Abort {
    return Command_Abort.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Abort>, I>>(_: I): Command_Abort {
    const message = createBaseCommand_Abort();
    return message;
  },
};

function createBaseCommand_Close(): Command_Close {
  return {};
}

export const Command_Close = {
  encode(_: Command_Close, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Close {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Close();
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

  fromJSON(_: any): Command_Close {
    return {};
  },

  toJSON(_: Command_Close): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Close>, I>>(base?: I): Command_Close {
    return Command_Close.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Close>, I>>(_: I): Command_Close {
    const message = createBaseCommand_Close();
    return message;
  },
};

function createBaseCommand_DisableMotor(): Command_DisableMotor {
  return {};
}

export const Command_DisableMotor = {
  encode(_: Command_DisableMotor, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_DisableMotor {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_DisableMotor();
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

  fromJSON(_: any): Command_DisableMotor {
    return {};
  },

  toJSON(_: Command_DisableMotor): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_DisableMotor>, I>>(base?: I): Command_DisableMotor {
    return Command_DisableMotor.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_DisableMotor>, I>>(_: I): Command_DisableMotor {
    const message = createBaseCommand_DisableMotor();
    return message;
  },
};

function createBaseCommand_EnableMotor(): Command_EnableMotor {
  return {};
}

export const Command_EnableMotor = {
  encode(_: Command_EnableMotor, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_EnableMotor {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_EnableMotor();
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

  fromJSON(_: any): Command_EnableMotor {
    return {};
  },

  toJSON(_: Command_EnableMotor): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_EnableMotor>, I>>(base?: I): Command_EnableMotor {
    return Command_EnableMotor.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_EnableMotor>, I>>(_: I): Command_EnableMotor {
    const message = createBaseCommand_EnableMotor();
    return message;
  },
};

function createBaseCommand_Jog(): Command_Jog {
  return { degree: 0, clockwise: false };
}

export const Command_Jog = {
  encode(message: Command_Jog, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.degree !== 0) {
      writer.uint32(13).float(message.degree);
    }
    if (message.clockwise === true) {
      writer.uint32(16).bool(message.clockwise);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Jog {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Jog();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.degree = reader.float();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.clockwise = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Jog {
    return {
      degree: isSet(object.degree) ? Number(object.degree) : 0,
      clockwise: isSet(object.clockwise) ? Boolean(object.clockwise) : false,
    };
  },

  toJSON(message: Command_Jog): unknown {
    const obj: any = {};
    message.degree !== undefined && (obj.degree = message.degree);
    message.clockwise !== undefined && (obj.clockwise = message.clockwise);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Jog>, I>>(base?: I): Command_Jog {
    return Command_Jog.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Jog>, I>>(object: I): Command_Jog {
    const message = createBaseCommand_Jog();
    message.degree = object.degree ?? 0;
    message.clockwise = object.clockwise ?? false;
    return message;
  },
};

function createBaseCommand_RotateToCassette(): Command_RotateToCassette {
  return { cassette_index: 0 };
}

export const Command_RotateToCassette = {
  encode(message: Command_RotateToCassette, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.cassette_index !== 0) {
      writer.uint32(8).int32(message.cassette_index);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_RotateToCassette {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_RotateToCassette();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.cassette_index = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_RotateToCassette {
    return { cassette_index: isSet(object.cassette_index) ? Number(object.cassette_index) : 0 };
  },

  toJSON(message: Command_RotateToCassette): unknown {
    const obj: any = {};
    message.cassette_index !== undefined && (obj.cassette_index = Math.round(message.cassette_index));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RotateToCassette>, I>>(base?: I): Command_RotateToCassette {
    return Command_RotateToCassette.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RotateToCassette>, I>>(object: I): Command_RotateToCassette {
    const message = createBaseCommand_RotateToCassette();
    message.cassette_index = object.cassette_index ?? 0;
    return message;
  },
};

function createBaseCommand_RotateToDegree(): Command_RotateToDegree {
  return { degree: 0 };
}

export const Command_RotateToDegree = {
  encode(message: Command_RotateToDegree, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.degree !== 0) {
      writer.uint32(13).float(message.degree);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_RotateToDegree {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_RotateToDegree();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.degree = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_RotateToDegree {
    return { degree: isSet(object.degree) ? Number(object.degree) : 0 };
  },

  toJSON(message: Command_RotateToDegree): unknown {
    const obj: any = {};
    message.degree !== undefined && (obj.degree = message.degree);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RotateToDegree>, I>>(base?: I): Command_RotateToDegree {
    return Command_RotateToDegree.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RotateToDegree>, I>>(object: I): Command_RotateToDegree {
    const message = createBaseCommand_RotateToDegree();
    message.degree = object.degree ?? 0;
    return message;
  },
};

function createBaseCommand_RotateToHomePosition(): Command_RotateToHomePosition {
  return {};
}

export const Command_RotateToHomePosition = {
  encode(_: Command_RotateToHomePosition, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_RotateToHomePosition {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_RotateToHomePosition();
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

  fromJSON(_: any): Command_RotateToHomePosition {
    return {};
  },

  toJSON(_: Command_RotateToHomePosition): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RotateToHomePosition>, I>>(base?: I): Command_RotateToHomePosition {
    return Command_RotateToHomePosition.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RotateToHomePosition>, I>>(_: I): Command_RotateToHomePosition {
    const message = createBaseCommand_RotateToHomePosition();
    return message;
  },
};

function createBaseCommand_SetSpeed(): Command_SetSpeed {
  return { speed: 0 };
}

export const Command_SetSpeed = {
  encode(message: Command_SetSpeed, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.speed !== 0) {
      writer.uint32(8).int32(message.speed);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SetSpeed {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SetSpeed();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.speed = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_SetSpeed {
    return { speed: isSet(object.speed) ? Number(object.speed) : 0 };
  },

  toJSON(message: Command_SetSpeed): unknown {
    const obj: any = {};
    message.speed !== undefined && (obj.speed = Math.round(message.speed));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SetSpeed>, I>>(base?: I): Command_SetSpeed {
    return Command_SetSpeed.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SetSpeed>, I>>(object: I): Command_SetSpeed {
    const message = createBaseCommand_SetSpeed();
    message.speed = object.speed ?? 0;
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

function createBaseCommand_TeachHome(): Command_TeachHome {
  return {};
}

export const Command_TeachHome = {
  encode(_: Command_TeachHome, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_TeachHome {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_TeachHome();
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

  fromJSON(_: any): Command_TeachHome {
    return {};
  },

  toJSON(_: Command_TeachHome): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_TeachHome>, I>>(base?: I): Command_TeachHome {
    return Command_TeachHome.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_TeachHome>, I>>(_: I): Command_TeachHome {
    const message = createBaseCommand_TeachHome();
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
