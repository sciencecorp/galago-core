/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Struct } from "../../google/protobuf/struct";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.toolbox";

export interface Command {
  slack_message?: Command_SlackMessage | undefined;
  run_script?: Command_RunScript | undefined;
  send_slack_alert?: Command_SendSlackAlert | undefined;
  clear_last_slack_alert?: Command_ClearLastSlackAlert | undefined;
  write_to_json?: Command_WriteToJson | undefined;
  text_to_speech?: Command_TextToSpeech | undefined;
}

export interface Command_WriteToJson {
  struct_object: { [key: string]: any } | undefined;
  file_path: string;
}

export interface Command_SlackMessage {
  message: string;
}

export interface Command_TextToSpeech {
  text: string;
}

export interface Command_RunScript {
  script_content: string;
  blocking: boolean;
}

export interface Command_SendSlackAlert {
  workcell: string;
  tool: string;
  protocol: string;
  error_message: string;
}

export interface Command_ClearLastSlackAlert {
}

export interface Command_ValidateFolder {
  folder_path: string;
}

export interface Config {
}

function createBaseCommand(): Command {
  return {
    slack_message: undefined,
    run_script: undefined,
    send_slack_alert: undefined,
    clear_last_slack_alert: undefined,
    write_to_json: undefined,
    text_to_speech: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.slack_message !== undefined) {
      Command_SlackMessage.encode(message.slack_message, writer.uint32(10).fork()).ldelim();
    }
    if (message.run_script !== undefined) {
      Command_RunScript.encode(message.run_script, writer.uint32(18).fork()).ldelim();
    }
    if (message.send_slack_alert !== undefined) {
      Command_SendSlackAlert.encode(message.send_slack_alert, writer.uint32(26).fork()).ldelim();
    }
    if (message.clear_last_slack_alert !== undefined) {
      Command_ClearLastSlackAlert.encode(message.clear_last_slack_alert, writer.uint32(34).fork()).ldelim();
    }
    if (message.write_to_json !== undefined) {
      Command_WriteToJson.encode(message.write_to_json, writer.uint32(42).fork()).ldelim();
    }
    if (message.text_to_speech !== undefined) {
      Command_TextToSpeech.encode(message.text_to_speech, writer.uint32(50).fork()).ldelim();
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

          message.slack_message = Command_SlackMessage.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.run_script = Command_RunScript.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.send_slack_alert = Command_SendSlackAlert.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.clear_last_slack_alert = Command_ClearLastSlackAlert.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.write_to_json = Command_WriteToJson.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.text_to_speech = Command_TextToSpeech.decode(reader, reader.uint32());
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
      slack_message: isSet(object.slack_message) ? Command_SlackMessage.fromJSON(object.slack_message) : undefined,
      run_script: isSet(object.run_script) ? Command_RunScript.fromJSON(object.run_script) : undefined,
      send_slack_alert: isSet(object.send_slack_alert)
        ? Command_SendSlackAlert.fromJSON(object.send_slack_alert)
        : undefined,
      clear_last_slack_alert: isSet(object.clear_last_slack_alert)
        ? Command_ClearLastSlackAlert.fromJSON(object.clear_last_slack_alert)
        : undefined,
      write_to_json: isSet(object.write_to_json) ? Command_WriteToJson.fromJSON(object.write_to_json) : undefined,
      text_to_speech: isSet(object.text_to_speech) ? Command_TextToSpeech.fromJSON(object.text_to_speech) : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.slack_message !== undefined &&
      (obj.slack_message = message.slack_message ? Command_SlackMessage.toJSON(message.slack_message) : undefined);
    message.run_script !== undefined &&
      (obj.run_script = message.run_script ? Command_RunScript.toJSON(message.run_script) : undefined);
    message.send_slack_alert !== undefined && (obj.send_slack_alert = message.send_slack_alert
      ? Command_SendSlackAlert.toJSON(message.send_slack_alert)
      : undefined);
    message.clear_last_slack_alert !== undefined && (obj.clear_last_slack_alert = message.clear_last_slack_alert
      ? Command_ClearLastSlackAlert.toJSON(message.clear_last_slack_alert)
      : undefined);
    message.write_to_json !== undefined &&
      (obj.write_to_json = message.write_to_json ? Command_WriteToJson.toJSON(message.write_to_json) : undefined);
    message.text_to_speech !== undefined &&
      (obj.text_to_speech = message.text_to_speech ? Command_TextToSpeech.toJSON(message.text_to_speech) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.slack_message = (object.slack_message !== undefined && object.slack_message !== null)
      ? Command_SlackMessage.fromPartial(object.slack_message)
      : undefined;
    message.run_script = (object.run_script !== undefined && object.run_script !== null)
      ? Command_RunScript.fromPartial(object.run_script)
      : undefined;
    message.send_slack_alert = (object.send_slack_alert !== undefined && object.send_slack_alert !== null)
      ? Command_SendSlackAlert.fromPartial(object.send_slack_alert)
      : undefined;
    message.clear_last_slack_alert =
      (object.clear_last_slack_alert !== undefined && object.clear_last_slack_alert !== null)
        ? Command_ClearLastSlackAlert.fromPartial(object.clear_last_slack_alert)
        : undefined;
    message.write_to_json = (object.write_to_json !== undefined && object.write_to_json !== null)
      ? Command_WriteToJson.fromPartial(object.write_to_json)
      : undefined;
    message.text_to_speech = (object.text_to_speech !== undefined && object.text_to_speech !== null)
      ? Command_TextToSpeech.fromPartial(object.text_to_speech)
      : undefined;
    return message;
  },
};

function createBaseCommand_WriteToJson(): Command_WriteToJson {
  return { struct_object: undefined, file_path: "" };
}

export const Command_WriteToJson = {
  encode(message: Command_WriteToJson, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.struct_object !== undefined) {
      Struct.encode(Struct.wrap(message.struct_object), writer.uint32(10).fork()).ldelim();
    }
    if (message.file_path !== "") {
      writer.uint32(18).string(message.file_path);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_WriteToJson {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_WriteToJson();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.struct_object = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.file_path = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_WriteToJson {
    return {
      struct_object: isObject(object.struct_object) ? object.struct_object : undefined,
      file_path: isSet(object.file_path) ? String(object.file_path) : "",
    };
  },

  toJSON(message: Command_WriteToJson): unknown {
    const obj: any = {};
    message.struct_object !== undefined && (obj.struct_object = message.struct_object);
    message.file_path !== undefined && (obj.file_path = message.file_path);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_WriteToJson>, I>>(base?: I): Command_WriteToJson {
    return Command_WriteToJson.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_WriteToJson>, I>>(object: I): Command_WriteToJson {
    const message = createBaseCommand_WriteToJson();
    message.struct_object = object.struct_object ?? undefined;
    message.file_path = object.file_path ?? "";
    return message;
  },
};

function createBaseCommand_SlackMessage(): Command_SlackMessage {
  return { message: "" };
}

export const Command_SlackMessage = {
  encode(message: Command_SlackMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SlackMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SlackMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.message = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_SlackMessage {
    return { message: isSet(object.message) ? String(object.message) : "" };
  },

  toJSON(message: Command_SlackMessage): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SlackMessage>, I>>(base?: I): Command_SlackMessage {
    return Command_SlackMessage.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SlackMessage>, I>>(object: I): Command_SlackMessage {
    const message = createBaseCommand_SlackMessage();
    message.message = object.message ?? "";
    return message;
  },
};

function createBaseCommand_TextToSpeech(): Command_TextToSpeech {
  return { text: "" };
}

export const Command_TextToSpeech = {
  encode(message: Command_TextToSpeech, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.text !== "") {
      writer.uint32(10).string(message.text);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_TextToSpeech {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_TextToSpeech();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.text = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_TextToSpeech {
    return { text: isSet(object.text) ? String(object.text) : "" };
  },

  toJSON(message: Command_TextToSpeech): unknown {
    const obj: any = {};
    message.text !== undefined && (obj.text = message.text);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_TextToSpeech>, I>>(base?: I): Command_TextToSpeech {
    return Command_TextToSpeech.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_TextToSpeech>, I>>(object: I): Command_TextToSpeech {
    const message = createBaseCommand_TextToSpeech();
    message.text = object.text ?? "";
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

function createBaseCommand_SendSlackAlert(): Command_SendSlackAlert {
  return { workcell: "", tool: "", protocol: "", error_message: "" };
}

export const Command_SendSlackAlert = {
  encode(message: Command_SendSlackAlert, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.workcell !== "") {
      writer.uint32(10).string(message.workcell);
    }
    if (message.tool !== "") {
      writer.uint32(18).string(message.tool);
    }
    if (message.protocol !== "") {
      writer.uint32(26).string(message.protocol);
    }
    if (message.error_message !== "") {
      writer.uint32(34).string(message.error_message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SendSlackAlert {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SendSlackAlert();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.workcell = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.tool = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.protocol = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.error_message = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_SendSlackAlert {
    return {
      workcell: isSet(object.workcell) ? String(object.workcell) : "",
      tool: isSet(object.tool) ? String(object.tool) : "",
      protocol: isSet(object.protocol) ? String(object.protocol) : "",
      error_message: isSet(object.error_message) ? String(object.error_message) : "",
    };
  },

  toJSON(message: Command_SendSlackAlert): unknown {
    const obj: any = {};
    message.workcell !== undefined && (obj.workcell = message.workcell);
    message.tool !== undefined && (obj.tool = message.tool);
    message.protocol !== undefined && (obj.protocol = message.protocol);
    message.error_message !== undefined && (obj.error_message = message.error_message);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SendSlackAlert>, I>>(base?: I): Command_SendSlackAlert {
    return Command_SendSlackAlert.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SendSlackAlert>, I>>(object: I): Command_SendSlackAlert {
    const message = createBaseCommand_SendSlackAlert();
    message.workcell = object.workcell ?? "";
    message.tool = object.tool ?? "";
    message.protocol = object.protocol ?? "";
    message.error_message = object.error_message ?? "";
    return message;
  },
};

function createBaseCommand_ClearLastSlackAlert(): Command_ClearLastSlackAlert {
  return {};
}

export const Command_ClearLastSlackAlert = {
  encode(_: Command_ClearLastSlackAlert, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_ClearLastSlackAlert {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_ClearLastSlackAlert();
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

  fromJSON(_: any): Command_ClearLastSlackAlert {
    return {};
  },

  toJSON(_: Command_ClearLastSlackAlert): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_ClearLastSlackAlert>, I>>(base?: I): Command_ClearLastSlackAlert {
    return Command_ClearLastSlackAlert.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ClearLastSlackAlert>, I>>(_: I): Command_ClearLastSlackAlert {
    const message = createBaseCommand_ClearLastSlackAlert();
    return message;
  },
};

function createBaseCommand_ValidateFolder(): Command_ValidateFolder {
  return { folder_path: "" };
}

export const Command_ValidateFolder = {
  encode(message: Command_ValidateFolder, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.folder_path !== "") {
      writer.uint32(10).string(message.folder_path);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_ValidateFolder {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_ValidateFolder();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.folder_path = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_ValidateFolder {
    return { folder_path: isSet(object.folder_path) ? String(object.folder_path) : "" };
  },

  toJSON(message: Command_ValidateFolder): unknown {
    const obj: any = {};
    message.folder_path !== undefined && (obj.folder_path = message.folder_path);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_ValidateFolder>, I>>(base?: I): Command_ValidateFolder {
    return Command_ValidateFolder.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ValidateFolder>, I>>(object: I): Command_ValidateFolder {
    const message = createBaseCommand_ValidateFolder();
    message.folder_path = object.folder_path ?? "";
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

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
