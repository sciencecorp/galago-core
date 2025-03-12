/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Config } from "./tools/grpc_interfaces/tool_base";

export const protobufPackage = "com.science.foundry.controller";

export enum ToolType {
  unknown = "unknown",
  cytation = "cytation",
  opentrons2 = "opentrons2",
  pf400 = "pf400",
  liconic = "liconic",
  dataman70 = "dataman70",
  spectramax = "spectramax",
  bioshake = "bioshake",
  hig_centrifuge = "hig_centrifuge",
  bravo = "bravo",
  vcode = "vcode",
  plateloc = "plateloc",
  xpeel = "xpeel",
  alps3000 = "alps3000",
  toolbox = "toolbox",
  hamilton = "hamilton",
  microserve = "microserve",
  UNRECOGNIZED = "UNRECOGNIZED",
}

export function toolTypeFromJSON(object: any): ToolType {
  switch (object) {
    case 0:
    case "unknown":
      return ToolType.unknown;
    case 1:
    case "cytation":
      return ToolType.cytation;
    case 2:
    case "opentrons2":
      return ToolType.opentrons2;
    case 3:
    case "pf400":
      return ToolType.pf400;
    case 4:
    case "liconic":
      return ToolType.liconic;
    case 5:
    case "dataman70":
      return ToolType.dataman70;
    case 6:
    case "spectramax":
      return ToolType.spectramax;
    case 7:
    case "bioshake":
      return ToolType.bioshake;
    case 9:
    case "hig_centrifuge":
      return ToolType.hig_centrifuge;
    case 10:
    case "bravo":
      return ToolType.bravo;
    case 11:
    case "vcode":
      return ToolType.vcode;
    case 12:
    case "plateloc":
      return ToolType.plateloc;
    case 13:
    case "xpeel":
      return ToolType.xpeel;
    case 14:
    case "alps3000":
      return ToolType.alps3000;
    case 15:
    case "toolbox":
      return ToolType.toolbox;
    case 16:
    case "hamilton":
      return ToolType.hamilton;
    case 17:
    case "microserve":
      return ToolType.microserve;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ToolType.UNRECOGNIZED;
  }
}

export function toolTypeToJSON(object: ToolType): string {
  switch (object) {
    case ToolType.unknown:
      return "unknown";
    case ToolType.cytation:
      return "cytation";
    case ToolType.opentrons2:
      return "opentrons2";
    case ToolType.pf400:
      return "pf400";
    case ToolType.liconic:
      return "liconic";
    case ToolType.dataman70:
      return "dataman70";
    case ToolType.spectramax:
      return "spectramax";
    case ToolType.bioshake:
      return "bioshake";
    case ToolType.hig_centrifuge:
      return "hig_centrifuge";
    case ToolType.bravo:
      return "bravo";
    case ToolType.vcode:
      return "vcode";
    case ToolType.plateloc:
      return "plateloc";
    case ToolType.xpeel:
      return "xpeel";
    case ToolType.alps3000:
      return "alps3000";
    case ToolType.toolbox:
      return "toolbox";
    case ToolType.hamilton:
      return "hamilton";
    case ToolType.microserve:
      return "microserve";
    case ToolType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export function toolTypeToNumber(object: ToolType): number {
  switch (object) {
    case ToolType.unknown:
      return 0;
    case ToolType.cytation:
      return 1;
    case ToolType.opentrons2:
      return 2;
    case ToolType.pf400:
      return 3;
    case ToolType.liconic:
      return 4;
    case ToolType.dataman70:
      return 5;
    case ToolType.spectramax:
      return 6;
    case ToolType.bioshake:
      return 7;
    case ToolType.hig_centrifuge:
      return 9;
    case ToolType.bravo:
      return 10;
    case ToolType.vcode:
      return 11;
    case ToolType.plateloc:
      return 12;
    case ToolType.xpeel:
      return 13;
    case ToolType.alps3000:
      return 14;
    case ToolType.toolbox:
      return 15;
    case ToolType.hamilton:
      return 16;
    case ToolType.microserve:
      return 17;
    case ToolType.UNRECOGNIZED:
    default:
      return -1;
  }
}

export interface ToolConfig {
  name: string;
  type: ToolType;
  ip: string;
  port: number;
  config: Config | undefined;
  description: string;
  image_url: string;
}

export interface WorkcellConfig {
  id: string;
  name: string;
  description: string;
  location: string;
  tools: ToolConfig[];
}

export interface AppConfig {
  workcell: string;
  host_ip: string;
  redis_ip: string;
  slack_bot_tocken: string;
  slack_channel_id: string;
  enable_slack_error: boolean;
  slack_admins_ids: string[];
}

function createBaseToolConfig(): ToolConfig {
  return { name: "", type: ToolType.unknown, ip: "", port: 0, config: undefined, description: "", image_url: "" };
}

export const ToolConfig = {
  encode(message: ToolConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.type !== ToolType.unknown) {
      writer.uint32(16).int32(toolTypeToNumber(message.type));
    }
    if (message.ip !== "") {
      writer.uint32(26).string(message.ip);
    }
    if (message.port !== 0) {
      writer.uint32(32).int32(message.port);
    }
    if (message.config !== undefined) {
      Config.encode(message.config, writer.uint32(42).fork()).ldelim();
    }
    if (message.description !== "") {
      writer.uint32(58).string(message.description);
    }
    if (message.image_url !== "") {
      writer.uint32(66).string(message.image_url);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ToolConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseToolConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.type = toolTypeFromJSON(reader.int32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.ip = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.port = reader.int32();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.config = Config.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.description = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.image_url = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ToolConfig {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      type: isSet(object.type) ? toolTypeFromJSON(object.type) : ToolType.unknown,
      ip: isSet(object.ip) ? String(object.ip) : "",
      port: isSet(object.port) ? Number(object.port) : 0,
      config: isSet(object.config) ? Config.fromJSON(object.config) : undefined,
      description: isSet(object.description) ? String(object.description) : "",
      image_url: isSet(object.image_url) ? String(object.image_url) : "",
    };
  },

  toJSON(message: ToolConfig): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.type !== undefined && (obj.type = toolTypeToJSON(message.type));
    message.ip !== undefined && (obj.ip = message.ip);
    message.port !== undefined && (obj.port = Math.round(message.port));
    message.config !== undefined && (obj.config = message.config ? Config.toJSON(message.config) : undefined);
    message.description !== undefined && (obj.description = message.description);
    message.image_url !== undefined && (obj.image_url = message.image_url);
    return obj;
  },

  create<I extends Exact<DeepPartial<ToolConfig>, I>>(base?: I): ToolConfig {
    return ToolConfig.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ToolConfig>, I>>(object: I): ToolConfig {
    const message = createBaseToolConfig();
    message.name = object.name ?? "";
    message.type = object.type ?? ToolType.unknown;
    message.ip = object.ip ?? "";
    message.port = object.port ?? 0;
    message.config = (object.config !== undefined && object.config !== null)
      ? Config.fromPartial(object.config)
      : undefined;
    message.description = object.description ?? "";
    message.image_url = object.image_url ?? "";
    return message;
  },
};

function createBaseWorkcellConfig(): WorkcellConfig {
  return { id: "", name: "", description: "", location: "", tools: [] };
}

export const WorkcellConfig = {
  encode(message: WorkcellConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    if (message.location !== "") {
      writer.uint32(34).string(message.location);
    }
    for (const v of message.tools) {
      ToolConfig.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WorkcellConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWorkcellConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.location = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.tools.push(ToolConfig.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): WorkcellConfig {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description) ? String(object.description) : "",
      location: isSet(object.location) ? String(object.location) : "",
      tools: Array.isArray(object?.tools) ? object.tools.map((e: any) => ToolConfig.fromJSON(e)) : [],
    };
  },

  toJSON(message: WorkcellConfig): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined && (obj.description = message.description);
    message.location !== undefined && (obj.location = message.location);
    if (message.tools) {
      obj.tools = message.tools.map((e) => e ? ToolConfig.toJSON(e) : undefined);
    } else {
      obj.tools = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<WorkcellConfig>, I>>(base?: I): WorkcellConfig {
    return WorkcellConfig.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<WorkcellConfig>, I>>(object: I): WorkcellConfig {
    const message = createBaseWorkcellConfig();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.description = object.description ?? "";
    message.location = object.location ?? "";
    message.tools = object.tools?.map((e) => ToolConfig.fromPartial(e)) || [];
    return message;
  },
};

function createBaseAppConfig(): AppConfig {
  return {
    workcell: "",
    host_ip: "",
    redis_ip: "",
    slack_bot_tocken: "",
    slack_channel_id: "",
    enable_slack_error: false,
    slack_admins_ids: [],
  };
}

export const AppConfig = {
  encode(message: AppConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.workcell !== "") {
      writer.uint32(10).string(message.workcell);
    }
    if (message.host_ip !== "") {
      writer.uint32(18).string(message.host_ip);
    }
    if (message.redis_ip !== "") {
      writer.uint32(26).string(message.redis_ip);
    }
    if (message.slack_bot_tocken !== "") {
      writer.uint32(34).string(message.slack_bot_tocken);
    }
    if (message.slack_channel_id !== "") {
      writer.uint32(42).string(message.slack_channel_id);
    }
    if (message.enable_slack_error === true) {
      writer.uint32(48).bool(message.enable_slack_error);
    }
    for (const v of message.slack_admins_ids) {
      writer.uint32(58).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AppConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAppConfig();
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

          message.host_ip = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.redis_ip = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.slack_bot_tocken = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.slack_channel_id = reader.string();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.enable_slack_error = reader.bool();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.slack_admins_ids.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): AppConfig {
    return {
      workcell: isSet(object.workcell) ? String(object.workcell) : "",
      host_ip: isSet(object.host_ip) ? String(object.host_ip) : "",
      redis_ip: isSet(object.redis_ip) ? String(object.redis_ip) : "",
      slack_bot_tocken: isSet(object.slack_bot_tocken) ? String(object.slack_bot_tocken) : "",
      slack_channel_id: isSet(object.slack_channel_id) ? String(object.slack_channel_id) : "",
      enable_slack_error: isSet(object.enable_slack_error) ? Boolean(object.enable_slack_error) : false,
      slack_admins_ids: Array.isArray(object?.slack_admins_ids)
        ? object.slack_admins_ids.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: AppConfig): unknown {
    const obj: any = {};
    message.workcell !== undefined && (obj.workcell = message.workcell);
    message.host_ip !== undefined && (obj.host_ip = message.host_ip);
    message.redis_ip !== undefined && (obj.redis_ip = message.redis_ip);
    message.slack_bot_tocken !== undefined && (obj.slack_bot_tocken = message.slack_bot_tocken);
    message.slack_channel_id !== undefined && (obj.slack_channel_id = message.slack_channel_id);
    message.enable_slack_error !== undefined && (obj.enable_slack_error = message.enable_slack_error);
    if (message.slack_admins_ids) {
      obj.slack_admins_ids = message.slack_admins_ids.map((e) => e);
    } else {
      obj.slack_admins_ids = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<AppConfig>, I>>(base?: I): AppConfig {
    return AppConfig.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<AppConfig>, I>>(object: I): AppConfig {
    const message = createBaseAppConfig();
    message.workcell = object.workcell ?? "";
    message.host_ip = object.host_ip ?? "";
    message.redis_ip = object.redis_ip ?? "";
    message.slack_bot_tocken = object.slack_bot_tocken ?? "";
    message.slack_channel_id = object.slack_channel_id ?? "";
    message.enable_slack_error = object.enable_slack_error ?? false;
    message.slack_admins_ids = object.slack_admins_ids?.map((e) => e) || [];
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
