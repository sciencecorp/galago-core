/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.vstack";

export interface Command {
  abort?: Command_Abort | undefined;
  close?: Command_Close | undefined;
  downstack?: Command_Downstack | undefined;
  home?: Command_Home | undefined;
  jog?: Command_Jog | undefined;
  load_stack?: Command_LoadStack | undefined;
  open_gripper?: Command_OpenGripper | undefined;
  release_stack?: Command_ReleaseStack | undefined;
  set_button_mode?: Command_SetButtonMode | undefined;
  set_labware?: Command_SetLabware | undefined;
  show_diagnostics?: Command_ShowDiagsDialog | undefined;
  upstack?: Command_Upstack | undefined;
}

export interface Command_Abort {
}

export interface Command_Close {
}

export interface Command_Downstack {
}

export interface Command_Home {
}

export interface Command_Jog {
  increment: number;
}

export interface Command_LoadStack {
}

export interface Command_OpenGripper {
  open: boolean;
}

export interface Command_ReleaseStack {
}

export interface Command_SetButtonMode {
  run_mode: boolean;
  reply: string;
}

export interface Command_SetLabware {
  labware: string;
  plate_dimension_select: number;
}

export interface Command_ShowDiagsDialog {
}

export interface Command_Upstack {
}

export interface Config {
  profile: string;
}

function createBaseCommand(): Command {
  return {
    abort: undefined,
    close: undefined,
    downstack: undefined,
    home: undefined,
    jog: undefined,
    load_stack: undefined,
    open_gripper: undefined,
    release_stack: undefined,
    set_button_mode: undefined,
    set_labware: undefined,
    show_diagnostics: undefined,
    upstack: undefined,
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
    if (message.downstack !== undefined) {
      Command_Downstack.encode(message.downstack, writer.uint32(26).fork()).ldelim();
    }
    if (message.home !== undefined) {
      Command_Home.encode(message.home, writer.uint32(34).fork()).ldelim();
    }
    if (message.jog !== undefined) {
      Command_Jog.encode(message.jog, writer.uint32(42).fork()).ldelim();
    }
    if (message.load_stack !== undefined) {
      Command_LoadStack.encode(message.load_stack, writer.uint32(50).fork()).ldelim();
    }
    if (message.open_gripper !== undefined) {
      Command_OpenGripper.encode(message.open_gripper, writer.uint32(58).fork()).ldelim();
    }
    if (message.release_stack !== undefined) {
      Command_ReleaseStack.encode(message.release_stack, writer.uint32(66).fork()).ldelim();
    }
    if (message.set_button_mode !== undefined) {
      Command_SetButtonMode.encode(message.set_button_mode, writer.uint32(74).fork()).ldelim();
    }
    if (message.set_labware !== undefined) {
      Command_SetLabware.encode(message.set_labware, writer.uint32(82).fork()).ldelim();
    }
    if (message.show_diagnostics !== undefined) {
      Command_ShowDiagsDialog.encode(message.show_diagnostics, writer.uint32(90).fork()).ldelim();
    }
    if (message.upstack !== undefined) {
      Command_Upstack.encode(message.upstack, writer.uint32(98).fork()).ldelim();
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

          message.downstack = Command_Downstack.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.home = Command_Home.decode(reader, reader.uint32());
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

          message.load_stack = Command_LoadStack.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.open_gripper = Command_OpenGripper.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.release_stack = Command_ReleaseStack.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.set_button_mode = Command_SetButtonMode.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.set_labware = Command_SetLabware.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.show_diagnostics = Command_ShowDiagsDialog.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.upstack = Command_Upstack.decode(reader, reader.uint32());
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
      downstack: isSet(object.downstack) ? Command_Downstack.fromJSON(object.downstack) : undefined,
      home: isSet(object.home) ? Command_Home.fromJSON(object.home) : undefined,
      jog: isSet(object.jog) ? Command_Jog.fromJSON(object.jog) : undefined,
      load_stack: isSet(object.load_stack) ? Command_LoadStack.fromJSON(object.load_stack) : undefined,
      open_gripper: isSet(object.open_gripper) ? Command_OpenGripper.fromJSON(object.open_gripper) : undefined,
      release_stack: isSet(object.release_stack) ? Command_ReleaseStack.fromJSON(object.release_stack) : undefined,
      set_button_mode: isSet(object.set_button_mode)
        ? Command_SetButtonMode.fromJSON(object.set_button_mode)
        : undefined,
      set_labware: isSet(object.set_labware) ? Command_SetLabware.fromJSON(object.set_labware) : undefined,
      show_diagnostics: isSet(object.show_diagnostics)
        ? Command_ShowDiagsDialog.fromJSON(object.show_diagnostics)
        : undefined,
      upstack: isSet(object.upstack) ? Command_Upstack.fromJSON(object.upstack) : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.abort !== undefined && (obj.abort = message.abort ? Command_Abort.toJSON(message.abort) : undefined);
    message.close !== undefined && (obj.close = message.close ? Command_Close.toJSON(message.close) : undefined);
    message.downstack !== undefined &&
      (obj.downstack = message.downstack ? Command_Downstack.toJSON(message.downstack) : undefined);
    message.home !== undefined && (obj.home = message.home ? Command_Home.toJSON(message.home) : undefined);
    message.jog !== undefined && (obj.jog = message.jog ? Command_Jog.toJSON(message.jog) : undefined);
    message.load_stack !== undefined &&
      (obj.load_stack = message.load_stack ? Command_LoadStack.toJSON(message.load_stack) : undefined);
    message.open_gripper !== undefined &&
      (obj.open_gripper = message.open_gripper ? Command_OpenGripper.toJSON(message.open_gripper) : undefined);
    message.release_stack !== undefined &&
      (obj.release_stack = message.release_stack ? Command_ReleaseStack.toJSON(message.release_stack) : undefined);
    message.set_button_mode !== undefined &&
      (obj.set_button_mode = message.set_button_mode
        ? Command_SetButtonMode.toJSON(message.set_button_mode)
        : undefined);
    message.set_labware !== undefined &&
      (obj.set_labware = message.set_labware ? Command_SetLabware.toJSON(message.set_labware) : undefined);
    message.show_diagnostics !== undefined && (obj.show_diagnostics = message.show_diagnostics
      ? Command_ShowDiagsDialog.toJSON(message.show_diagnostics)
      : undefined);
    message.upstack !== undefined &&
      (obj.upstack = message.upstack ? Command_Upstack.toJSON(message.upstack) : undefined);
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
    message.downstack = (object.downstack !== undefined && object.downstack !== null)
      ? Command_Downstack.fromPartial(object.downstack)
      : undefined;
    message.home = (object.home !== undefined && object.home !== null)
      ? Command_Home.fromPartial(object.home)
      : undefined;
    message.jog = (object.jog !== undefined && object.jog !== null) ? Command_Jog.fromPartial(object.jog) : undefined;
    message.load_stack = (object.load_stack !== undefined && object.load_stack !== null)
      ? Command_LoadStack.fromPartial(object.load_stack)
      : undefined;
    message.open_gripper = (object.open_gripper !== undefined && object.open_gripper !== null)
      ? Command_OpenGripper.fromPartial(object.open_gripper)
      : undefined;
    message.release_stack = (object.release_stack !== undefined && object.release_stack !== null)
      ? Command_ReleaseStack.fromPartial(object.release_stack)
      : undefined;
    message.set_button_mode = (object.set_button_mode !== undefined && object.set_button_mode !== null)
      ? Command_SetButtonMode.fromPartial(object.set_button_mode)
      : undefined;
    message.set_labware = (object.set_labware !== undefined && object.set_labware !== null)
      ? Command_SetLabware.fromPartial(object.set_labware)
      : undefined;
    message.show_diagnostics = (object.show_diagnostics !== undefined && object.show_diagnostics !== null)
      ? Command_ShowDiagsDialog.fromPartial(object.show_diagnostics)
      : undefined;
    message.upstack = (object.upstack !== undefined && object.upstack !== null)
      ? Command_Upstack.fromPartial(object.upstack)
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

function createBaseCommand_Downstack(): Command_Downstack {
  return {};
}

export const Command_Downstack = {
  encode(_: Command_Downstack, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Downstack {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Downstack();
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

  fromJSON(_: any): Command_Downstack {
    return {};
  },

  toJSON(_: Command_Downstack): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Downstack>, I>>(base?: I): Command_Downstack {
    return Command_Downstack.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Downstack>, I>>(_: I): Command_Downstack {
    const message = createBaseCommand_Downstack();
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

function createBaseCommand_Jog(): Command_Jog {
  return { increment: 0 };
}

export const Command_Jog = {
  encode(message: Command_Jog, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.increment !== 0) {
      writer.uint32(13).float(message.increment);
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

          message.increment = reader.float();
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
    return { increment: isSet(object.increment) ? Number(object.increment) : 0 };
  },

  toJSON(message: Command_Jog): unknown {
    const obj: any = {};
    message.increment !== undefined && (obj.increment = message.increment);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Jog>, I>>(base?: I): Command_Jog {
    return Command_Jog.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Jog>, I>>(object: I): Command_Jog {
    const message = createBaseCommand_Jog();
    message.increment = object.increment ?? 0;
    return message;
  },
};

function createBaseCommand_LoadStack(): Command_LoadStack {
  return {};
}

export const Command_LoadStack = {
  encode(_: Command_LoadStack, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_LoadStack {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_LoadStack();
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

  fromJSON(_: any): Command_LoadStack {
    return {};
  },

  toJSON(_: Command_LoadStack): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_LoadStack>, I>>(base?: I): Command_LoadStack {
    return Command_LoadStack.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_LoadStack>, I>>(_: I): Command_LoadStack {
    const message = createBaseCommand_LoadStack();
    return message;
  },
};

function createBaseCommand_OpenGripper(): Command_OpenGripper {
  return { open: false };
}

export const Command_OpenGripper = {
  encode(message: Command_OpenGripper, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.open === true) {
      writer.uint32(8).bool(message.open);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_OpenGripper {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_OpenGripper();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.open = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_OpenGripper {
    return { open: isSet(object.open) ? Boolean(object.open) : false };
  },

  toJSON(message: Command_OpenGripper): unknown {
    const obj: any = {};
    message.open !== undefined && (obj.open = message.open);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_OpenGripper>, I>>(base?: I): Command_OpenGripper {
    return Command_OpenGripper.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_OpenGripper>, I>>(object: I): Command_OpenGripper {
    const message = createBaseCommand_OpenGripper();
    message.open = object.open ?? false;
    return message;
  },
};

function createBaseCommand_ReleaseStack(): Command_ReleaseStack {
  return {};
}

export const Command_ReleaseStack = {
  encode(_: Command_ReleaseStack, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_ReleaseStack {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_ReleaseStack();
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

  fromJSON(_: any): Command_ReleaseStack {
    return {};
  },

  toJSON(_: Command_ReleaseStack): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_ReleaseStack>, I>>(base?: I): Command_ReleaseStack {
    return Command_ReleaseStack.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ReleaseStack>, I>>(_: I): Command_ReleaseStack {
    const message = createBaseCommand_ReleaseStack();
    return message;
  },
};

function createBaseCommand_SetButtonMode(): Command_SetButtonMode {
  return { run_mode: false, reply: "" };
}

export const Command_SetButtonMode = {
  encode(message: Command_SetButtonMode, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.run_mode === true) {
      writer.uint32(8).bool(message.run_mode);
    }
    if (message.reply !== "") {
      writer.uint32(18).string(message.reply);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SetButtonMode {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SetButtonMode();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.run_mode = reader.bool();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.reply = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_SetButtonMode {
    return {
      run_mode: isSet(object.run_mode) ? Boolean(object.run_mode) : false,
      reply: isSet(object.reply) ? String(object.reply) : "",
    };
  },

  toJSON(message: Command_SetButtonMode): unknown {
    const obj: any = {};
    message.run_mode !== undefined && (obj.run_mode = message.run_mode);
    message.reply !== undefined && (obj.reply = message.reply);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SetButtonMode>, I>>(base?: I): Command_SetButtonMode {
    return Command_SetButtonMode.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SetButtonMode>, I>>(object: I): Command_SetButtonMode {
    const message = createBaseCommand_SetButtonMode();
    message.run_mode = object.run_mode ?? false;
    message.reply = object.reply ?? "";
    return message;
  },
};

function createBaseCommand_SetLabware(): Command_SetLabware {
  return { labware: "", plate_dimension_select: 0 };
}

export const Command_SetLabware = {
  encode(message: Command_SetLabware, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.labware !== "") {
      writer.uint32(10).string(message.labware);
    }
    if (message.plate_dimension_select !== 0) {
      writer.uint32(16).int32(message.plate_dimension_select);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SetLabware {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SetLabware();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.labware = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.plate_dimension_select = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_SetLabware {
    return {
      labware: isSet(object.labware) ? String(object.labware) : "",
      plate_dimension_select: isSet(object.plate_dimension_select) ? Number(object.plate_dimension_select) : 0,
    };
  },

  toJSON(message: Command_SetLabware): unknown {
    const obj: any = {};
    message.labware !== undefined && (obj.labware = message.labware);
    message.plate_dimension_select !== undefined &&
      (obj.plate_dimension_select = Math.round(message.plate_dimension_select));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SetLabware>, I>>(base?: I): Command_SetLabware {
    return Command_SetLabware.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SetLabware>, I>>(object: I): Command_SetLabware {
    const message = createBaseCommand_SetLabware();
    message.labware = object.labware ?? "";
    message.plate_dimension_select = object.plate_dimension_select ?? 0;
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

function createBaseCommand_Upstack(): Command_Upstack {
  return {};
}

export const Command_Upstack = {
  encode(_: Command_Upstack, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Upstack {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Upstack();
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

  fromJSON(_: any): Command_Upstack {
    return {};
  },

  toJSON(_: Command_Upstack): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Upstack>, I>>(base?: I): Command_Upstack {
    return Command_Upstack.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Upstack>, I>>(_: I): Command_Upstack {
    const message = createBaseCommand_Upstack();
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
