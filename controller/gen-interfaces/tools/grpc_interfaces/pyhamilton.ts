/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.pyhamilton";

export interface Command {
  run_local_script?: Command_RunLocalScript | undefined;
  run_script?: Command_RunScript | undefined;
}

export interface Command_RunLocalScript {
  path: string;
  blocking: boolean;
}

export interface Command_RunScript {
  script_content: string;
  blocking: boolean;
}

export interface Config {
  python_exe: string;
}

function createBaseCommand(): Command {
  return { run_local_script: undefined, run_script: undefined };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.run_local_script !== undefined) {
      Command_RunLocalScript.encode(message.run_local_script, writer.uint32(10).fork()).ldelim();
    }
    if (message.run_script !== undefined) {
      Command_RunScript.encode(message.run_script, writer.uint32(18).fork()).ldelim();
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

          message.run_local_script = Command_RunLocalScript.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.run_script = Command_RunScript.decode(reader, reader.uint32());
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
      run_local_script: isSet(object.run_local_script)
        ? Command_RunLocalScript.fromJSON(object.run_local_script)
        : undefined,
      run_script: isSet(object.run_script) ? Command_RunScript.fromJSON(object.run_script) : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.run_local_script !== undefined && (obj.run_local_script = message.run_local_script
      ? Command_RunLocalScript.toJSON(message.run_local_script)
      : undefined);
    message.run_script !== undefined &&
      (obj.run_script = message.run_script ? Command_RunScript.toJSON(message.run_script) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.run_local_script = (object.run_local_script !== undefined && object.run_local_script !== null)
      ? Command_RunLocalScript.fromPartial(object.run_local_script)
      : undefined;
    message.run_script = (object.run_script !== undefined && object.run_script !== null)
      ? Command_RunScript.fromPartial(object.run_script)
      : undefined;
    return message;
  },
};

function createBaseCommand_RunLocalScript(): Command_RunLocalScript {
  return { path: "", blocking: false };
}

export const Command_RunLocalScript = {
  encode(message: Command_RunLocalScript, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.path !== "") {
      writer.uint32(10).string(message.path);
    }
    if (message.blocking === true) {
      writer.uint32(16).bool(message.blocking);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_RunLocalScript {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_RunLocalScript();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.path = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.blocking = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_RunLocalScript {
    return {
      path: isSet(object.path) ? String(object.path) : "",
      blocking: isSet(object.blocking) ? Boolean(object.blocking) : false,
    };
  },

  toJSON(message: Command_RunLocalScript): unknown {
    const obj: any = {};
    message.path !== undefined && (obj.path = message.path);
    message.blocking !== undefined && (obj.blocking = message.blocking);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RunLocalScript>, I>>(base?: I): Command_RunLocalScript {
    return Command_RunLocalScript.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RunLocalScript>, I>>(object: I): Command_RunLocalScript {
    const message = createBaseCommand_RunLocalScript();
    message.path = object.path ?? "";
    message.blocking = object.blocking ?? false;
    return message;
  },
};

function createBaseCommand_RunScript(): Command_RunScript {
  return { script_content: "", blocking: false };
}

export const Command_RunScript = {
  encode(message: Command_RunScript, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.script_content !== "") {
      writer.uint32(10).string(message.script_content);
    }
    if (message.blocking === true) {
      writer.uint32(16).bool(message.blocking);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_RunScript {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_RunScript();
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
          if (tag !== 16) {
            break;
          }

          message.blocking = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_RunScript {
    return {
      script_content: isSet(object.script_content) ? String(object.script_content) : "",
      blocking: isSet(object.blocking) ? Boolean(object.blocking) : false,
    };
  },

  toJSON(message: Command_RunScript): unknown {
    const obj: any = {};
    message.script_content !== undefined && (obj.script_content = message.script_content);
    message.blocking !== undefined && (obj.blocking = message.blocking);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RunScript>, I>>(base?: I): Command_RunScript {
    return Command_RunScript.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RunScript>, I>>(object: I): Command_RunScript {
    const message = createBaseCommand_RunScript();
    message.script_content = object.script_content ?? "";
    message.blocking = object.blocking ?? false;
    return message;
  },
};

function createBaseConfig(): Config {
  return { python_exe: "" };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.python_exe !== "") {
      writer.uint32(10).string(message.python_exe);
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

          message.python_exe = reader.string();
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
    return { python_exe: isSet(object.python_exe) ? String(object.python_exe) : "" };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.python_exe !== undefined && (obj.python_exe = message.python_exe);
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.python_exe = object.python_exe ?? "";
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
