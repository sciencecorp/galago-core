/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Struct } from "../../google/protobuf/struct";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.opentrons2";

export interface Command {
  run_program?: Command_RunProgram | undefined;
  pause?: Command_Pause | undefined;
  resume?: Command_Resume | undefined;
  cancel?: Command_Cancel | undefined;
  toggle_light?: Command_ToggleLight | undefined;
}

export interface Command_RunProgram {
  script_content: string;
  variables: { [key: string]: any } | undefined;
}

export interface Command_Pause {
}

export interface Command_Resume {
}

export interface Command_Cancel {
}

export interface Command_ToggleLight {
}

export interface Config {
  robot_ip: string;
  robot_port: number;
}

function createBaseCommand(): Command {
  return { run_program: undefined, pause: undefined, resume: undefined, cancel: undefined, toggle_light: undefined };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.run_program !== undefined) {
      Command_RunProgram.encode(message.run_program, writer.uint32(10).fork()).ldelim();
    }
    if (message.pause !== undefined) {
      Command_Pause.encode(message.pause, writer.uint32(18).fork()).ldelim();
    }
    if (message.resume !== undefined) {
      Command_Resume.encode(message.resume, writer.uint32(26).fork()).ldelim();
    }
    if (message.cancel !== undefined) {
      Command_Cancel.encode(message.cancel, writer.uint32(34).fork()).ldelim();
    }
    if (message.toggle_light !== undefined) {
      Command_ToggleLight.encode(message.toggle_light, writer.uint32(42).fork()).ldelim();
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

          message.run_program = Command_RunProgram.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.pause = Command_Pause.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.resume = Command_Resume.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.cancel = Command_Cancel.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.toggle_light = Command_ToggleLight.decode(reader, reader.uint32());
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
      run_program: isSet(object.run_program) ? Command_RunProgram.fromJSON(object.run_program) : undefined,
      pause: isSet(object.pause) ? Command_Pause.fromJSON(object.pause) : undefined,
      resume: isSet(object.resume) ? Command_Resume.fromJSON(object.resume) : undefined,
      cancel: isSet(object.cancel) ? Command_Cancel.fromJSON(object.cancel) : undefined,
      toggle_light: isSet(object.toggle_light) ? Command_ToggleLight.fromJSON(object.toggle_light) : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.run_program !== undefined &&
      (obj.run_program = message.run_program ? Command_RunProgram.toJSON(message.run_program) : undefined);
    message.pause !== undefined && (obj.pause = message.pause ? Command_Pause.toJSON(message.pause) : undefined);
    message.resume !== undefined && (obj.resume = message.resume ? Command_Resume.toJSON(message.resume) : undefined);
    message.cancel !== undefined && (obj.cancel = message.cancel ? Command_Cancel.toJSON(message.cancel) : undefined);
    message.toggle_light !== undefined &&
      (obj.toggle_light = message.toggle_light ? Command_ToggleLight.toJSON(message.toggle_light) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.run_program = (object.run_program !== undefined && object.run_program !== null)
      ? Command_RunProgram.fromPartial(object.run_program)
      : undefined;
    message.pause = (object.pause !== undefined && object.pause !== null)
      ? Command_Pause.fromPartial(object.pause)
      : undefined;
    message.resume = (object.resume !== undefined && object.resume !== null)
      ? Command_Resume.fromPartial(object.resume)
      : undefined;
    message.cancel = (object.cancel !== undefined && object.cancel !== null)
      ? Command_Cancel.fromPartial(object.cancel)
      : undefined;
    message.toggle_light = (object.toggle_light !== undefined && object.toggle_light !== null)
      ? Command_ToggleLight.fromPartial(object.toggle_light)
      : undefined;
    return message;
  },
};

function createBaseCommand_RunProgram(): Command_RunProgram {
  return { script_content: "", variables: undefined };
}

export const Command_RunProgram = {
  encode(message: Command_RunProgram, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.script_content !== "") {
      writer.uint32(10).string(message.script_content);
    }
    if (message.variables !== undefined) {
      Struct.encode(Struct.wrap(message.variables), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_RunProgram {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_RunProgram();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.script_content = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.variables = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_RunProgram {
    return {
      script_content: isSet(object.script_content) ? String(object.script_content) : "",
      variables: isObject(object.variables) ? object.variables : undefined,
    };
  },

  toJSON(message: Command_RunProgram): unknown {
    const obj: any = {};
    message.script_content !== undefined && (obj.script_content = message.script_content);
    message.variables !== undefined && (obj.variables = message.variables);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RunProgram>, I>>(base?: I): Command_RunProgram {
    return Command_RunProgram.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RunProgram>, I>>(object: I): Command_RunProgram {
    const message = createBaseCommand_RunProgram();
    message.script_content = object.script_content ?? "";
    message.variables = object.variables ?? undefined;
    return message;
  },
};

function createBaseCommand_Pause(): Command_Pause {
  return {};
}

export const Command_Pause = {
  encode(_: Command_Pause, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Pause {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Pause();
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

  fromJSON(_: any): Command_Pause {
    return {};
  },

  toJSON(_: Command_Pause): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Pause>, I>>(base?: I): Command_Pause {
    return Command_Pause.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Pause>, I>>(_: I): Command_Pause {
    const message = createBaseCommand_Pause();
    return message;
  },
};

function createBaseCommand_Resume(): Command_Resume {
  return {};
}

export const Command_Resume = {
  encode(_: Command_Resume, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Resume {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Resume();
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

  fromJSON(_: any): Command_Resume {
    return {};
  },

  toJSON(_: Command_Resume): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Resume>, I>>(base?: I): Command_Resume {
    return Command_Resume.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Resume>, I>>(_: I): Command_Resume {
    const message = createBaseCommand_Resume();
    return message;
  },
};

function createBaseCommand_Cancel(): Command_Cancel {
  return {};
}

export const Command_Cancel = {
  encode(_: Command_Cancel, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Cancel {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Cancel();
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

  fromJSON(_: any): Command_Cancel {
    return {};
  },

  toJSON(_: Command_Cancel): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Cancel>, I>>(base?: I): Command_Cancel {
    return Command_Cancel.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Cancel>, I>>(_: I): Command_Cancel {
    const message = createBaseCommand_Cancel();
    return message;
  },
};

function createBaseCommand_ToggleLight(): Command_ToggleLight {
  return {};
}

export const Command_ToggleLight = {
  encode(_: Command_ToggleLight, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_ToggleLight {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_ToggleLight();
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

  fromJSON(_: any): Command_ToggleLight {
    return {};
  },

  toJSON(_: Command_ToggleLight): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_ToggleLight>, I>>(base?: I): Command_ToggleLight {
    return Command_ToggleLight.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ToggleLight>, I>>(_: I): Command_ToggleLight {
    const message = createBaseCommand_ToggleLight();
    return message;
  },
};

function createBaseConfig(): Config {
  return { robot_ip: "", robot_port: 0 };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.robot_ip !== "") {
      writer.uint32(10).string(message.robot_ip);
    }
    if (message.robot_port !== 0) {
      writer.uint32(16).int32(message.robot_port);
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

          message.robot_ip = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.robot_port = reader.int32();
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
      robot_ip: isSet(object.robot_ip) ? String(object.robot_ip) : "",
      robot_port: isSet(object.robot_port) ? Number(object.robot_port) : 0,
    };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.robot_ip !== undefined && (obj.robot_ip = message.robot_ip);
    message.robot_port !== undefined && (obj.robot_port = Math.round(message.robot_port));
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.robot_ip = object.robot_ip ?? "";
    message.robot_port = object.robot_port ?? 0;
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

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
