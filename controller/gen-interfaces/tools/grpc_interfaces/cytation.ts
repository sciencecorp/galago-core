/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.cytation";

export interface Command {
  open_carrier?: Command_OpenCarrier | undefined;
  close_carrier?: Command_CloseCarrier | undefined;
  start_read?: Command_StartRead | undefined;
}

export interface Command_OpenCarrier {
}

export interface Command_CloseCarrier {
}

export interface Command_StartRead {
  protocol_file: string;
  experiment_name?: string | undefined;
  well_addresses: string[];
}

export interface Config {
  protocol_dir: string;
  experiment_dir: string;
  reader_type: Config_CytationReaderType;
  tool_id: string;
}

export enum Config_CytationReaderType {
  CYTATION_UNKNOWN = "CYTATION_UNKNOWN",
  CYTATION_READER_ELX800 = "CYTATION_READER_ELX800",
  CYTATION_READER_ELX808 = "CYTATION_READER_ELX808",
  CYTATION_READER_SYNERGY_HT = "CYTATION_READER_SYNERGY_HT",
  CYTATION_READER_FLX800 = "CYTATION_READER_FLX800",
  CYTATION_READER_POWERWAVE = "CYTATION_READER_POWERWAVE",
  CYTATION_READER_SYNERGY2 = "CYTATION_READER_SYNERGY2",
  CYTATION_READER_POWERWAVEXS2 = "CYTATION_READER_POWERWAVEXS2",
  CYTATION_READER_SYNERGY_MX = "CYTATION_READER_SYNERGY_MX",
  CYTATION_READER_EPOCH = "CYTATION_READER_EPOCH",
  CYTATION_READER_SYNERGY_H4 = "CYTATION_READER_SYNERGY_H4",
  CYTATION_READER_SYNERGY_H1 = "CYTATION_READER_SYNERGY_H1",
  CYTATION_READER_EON = "CYTATION_READER_EON",
  CYTATION_READER_SYNERGY_NEO = "CYTATION_READER_SYNERGY_NEO",
  CYTATION_READER_CYTATION3 = "CYTATION_READER_CYTATION3",
  CYTATION_READER_SYNERGY_HTX = "CYTATION_READER_SYNERGY_HTX",
  CYTATION_READER_CYTATION5 = "CYTATION_READER_CYTATION5",
  CYTATION_READER_EPOCH2 = "CYTATION_READER_EPOCH2",
  CYTATION_READER_SYNERGY_NEO2 = "CYTATION_READER_SYNERGY_NEO2",
  CYTATION_READER_LIONHEART_FX = "CYTATION_READER_LIONHEART_FX",
  CYTATION_READER_800TS = "CYTATION_READER_800TS",
  CYTATION_READER_CYTATION1 = "CYTATION_READER_CYTATION1",
  CYTATION_READER_SYNERGY_LX = "CYTATION_READER_SYNERGY_LX",
  CYTATION_READER_LIONHEART_LX = "CYTATION_READER_LIONHEART_LX",
  UNRECOGNIZED = "UNRECOGNIZED",
}

export function config_CytationReaderTypeFromJSON(object: any): Config_CytationReaderType {
  switch (object) {
    case 0:
    case "CYTATION_UNKNOWN":
      return Config_CytationReaderType.CYTATION_UNKNOWN;
    case 2:
    case "CYTATION_READER_ELX800":
      return Config_CytationReaderType.CYTATION_READER_ELX800;
    case 3:
    case "CYTATION_READER_ELX808":
      return Config_CytationReaderType.CYTATION_READER_ELX808;
    case 6:
    case "CYTATION_READER_SYNERGY_HT":
      return Config_CytationReaderType.CYTATION_READER_SYNERGY_HT;
    case 7:
    case "CYTATION_READER_FLX800":
      return Config_CytationReaderType.CYTATION_READER_FLX800;
    case 8:
    case "CYTATION_READER_POWERWAVE":
      return Config_CytationReaderType.CYTATION_READER_POWERWAVE;
    case 10:
    case "CYTATION_READER_SYNERGY2":
      return Config_CytationReaderType.CYTATION_READER_SYNERGY2;
    case 11:
    case "CYTATION_READER_POWERWAVEXS2":
      return Config_CytationReaderType.CYTATION_READER_POWERWAVEXS2;
    case 13:
    case "CYTATION_READER_SYNERGY_MX":
      return Config_CytationReaderType.CYTATION_READER_SYNERGY_MX;
    case 14:
    case "CYTATION_READER_EPOCH":
      return Config_CytationReaderType.CYTATION_READER_EPOCH;
    case 15:
    case "CYTATION_READER_SYNERGY_H4":
      return Config_CytationReaderType.CYTATION_READER_SYNERGY_H4;
    case 16:
    case "CYTATION_READER_SYNERGY_H1":
      return Config_CytationReaderType.CYTATION_READER_SYNERGY_H1;
    case 17:
    case "CYTATION_READER_EON":
      return Config_CytationReaderType.CYTATION_READER_EON;
    case 18:
    case "CYTATION_READER_SYNERGY_NEO":
      return Config_CytationReaderType.CYTATION_READER_SYNERGY_NEO;
    case 19:
    case "CYTATION_READER_CYTATION3":
      return Config_CytationReaderType.CYTATION_READER_CYTATION3;
    case 20:
    case "CYTATION_READER_SYNERGY_HTX":
      return Config_CytationReaderType.CYTATION_READER_SYNERGY_HTX;
    case 21:
    case "CYTATION_READER_CYTATION5":
      return Config_CytationReaderType.CYTATION_READER_CYTATION5;
    case 22:
    case "CYTATION_READER_EPOCH2":
      return Config_CytationReaderType.CYTATION_READER_EPOCH2;
    case 23:
    case "CYTATION_READER_SYNERGY_NEO2":
      return Config_CytationReaderType.CYTATION_READER_SYNERGY_NEO2;
    case 24:
    case "CYTATION_READER_LIONHEART_FX":
      return Config_CytationReaderType.CYTATION_READER_LIONHEART_FX;
    case 25:
    case "CYTATION_READER_800TS":
      return Config_CytationReaderType.CYTATION_READER_800TS;
    case 26:
    case "CYTATION_READER_CYTATION1":
      return Config_CytationReaderType.CYTATION_READER_CYTATION1;
    case 27:
    case "CYTATION_READER_SYNERGY_LX":
      return Config_CytationReaderType.CYTATION_READER_SYNERGY_LX;
    case 28:
    case "CYTATION_READER_LIONHEART_LX":
      return Config_CytationReaderType.CYTATION_READER_LIONHEART_LX;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Config_CytationReaderType.UNRECOGNIZED;
  }
}

export function config_CytationReaderTypeToJSON(object: Config_CytationReaderType): string {
  switch (object) {
    case Config_CytationReaderType.CYTATION_UNKNOWN:
      return "CYTATION_UNKNOWN";
    case Config_CytationReaderType.CYTATION_READER_ELX800:
      return "CYTATION_READER_ELX800";
    case Config_CytationReaderType.CYTATION_READER_ELX808:
      return "CYTATION_READER_ELX808";
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_HT:
      return "CYTATION_READER_SYNERGY_HT";
    case Config_CytationReaderType.CYTATION_READER_FLX800:
      return "CYTATION_READER_FLX800";
    case Config_CytationReaderType.CYTATION_READER_POWERWAVE:
      return "CYTATION_READER_POWERWAVE";
    case Config_CytationReaderType.CYTATION_READER_SYNERGY2:
      return "CYTATION_READER_SYNERGY2";
    case Config_CytationReaderType.CYTATION_READER_POWERWAVEXS2:
      return "CYTATION_READER_POWERWAVEXS2";
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_MX:
      return "CYTATION_READER_SYNERGY_MX";
    case Config_CytationReaderType.CYTATION_READER_EPOCH:
      return "CYTATION_READER_EPOCH";
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_H4:
      return "CYTATION_READER_SYNERGY_H4";
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_H1:
      return "CYTATION_READER_SYNERGY_H1";
    case Config_CytationReaderType.CYTATION_READER_EON:
      return "CYTATION_READER_EON";
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_NEO:
      return "CYTATION_READER_SYNERGY_NEO";
    case Config_CytationReaderType.CYTATION_READER_CYTATION3:
      return "CYTATION_READER_CYTATION3";
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_HTX:
      return "CYTATION_READER_SYNERGY_HTX";
    case Config_CytationReaderType.CYTATION_READER_CYTATION5:
      return "CYTATION_READER_CYTATION5";
    case Config_CytationReaderType.CYTATION_READER_EPOCH2:
      return "CYTATION_READER_EPOCH2";
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_NEO2:
      return "CYTATION_READER_SYNERGY_NEO2";
    case Config_CytationReaderType.CYTATION_READER_LIONHEART_FX:
      return "CYTATION_READER_LIONHEART_FX";
    case Config_CytationReaderType.CYTATION_READER_800TS:
      return "CYTATION_READER_800TS";
    case Config_CytationReaderType.CYTATION_READER_CYTATION1:
      return "CYTATION_READER_CYTATION1";
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_LX:
      return "CYTATION_READER_SYNERGY_LX";
    case Config_CytationReaderType.CYTATION_READER_LIONHEART_LX:
      return "CYTATION_READER_LIONHEART_LX";
    case Config_CytationReaderType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export function config_CytationReaderTypeToNumber(object: Config_CytationReaderType): number {
  switch (object) {
    case Config_CytationReaderType.CYTATION_UNKNOWN:
      return 0;
    case Config_CytationReaderType.CYTATION_READER_ELX800:
      return 2;
    case Config_CytationReaderType.CYTATION_READER_ELX808:
      return 3;
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_HT:
      return 6;
    case Config_CytationReaderType.CYTATION_READER_FLX800:
      return 7;
    case Config_CytationReaderType.CYTATION_READER_POWERWAVE:
      return 8;
    case Config_CytationReaderType.CYTATION_READER_SYNERGY2:
      return 10;
    case Config_CytationReaderType.CYTATION_READER_POWERWAVEXS2:
      return 11;
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_MX:
      return 13;
    case Config_CytationReaderType.CYTATION_READER_EPOCH:
      return 14;
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_H4:
      return 15;
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_H1:
      return 16;
    case Config_CytationReaderType.CYTATION_READER_EON:
      return 17;
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_NEO:
      return 18;
    case Config_CytationReaderType.CYTATION_READER_CYTATION3:
      return 19;
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_HTX:
      return 20;
    case Config_CytationReaderType.CYTATION_READER_CYTATION5:
      return 21;
    case Config_CytationReaderType.CYTATION_READER_EPOCH2:
      return 22;
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_NEO2:
      return 23;
    case Config_CytationReaderType.CYTATION_READER_LIONHEART_FX:
      return 24;
    case Config_CytationReaderType.CYTATION_READER_800TS:
      return 25;
    case Config_CytationReaderType.CYTATION_READER_CYTATION1:
      return 26;
    case Config_CytationReaderType.CYTATION_READER_SYNERGY_LX:
      return 27;
    case Config_CytationReaderType.CYTATION_READER_LIONHEART_LX:
      return 28;
    case Config_CytationReaderType.UNRECOGNIZED:
    default:
      return -1;
  }
}

function createBaseCommand(): Command {
  return { open_carrier: undefined, close_carrier: undefined, start_read: undefined };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.open_carrier !== undefined) {
      Command_OpenCarrier.encode(message.open_carrier, writer.uint32(10).fork()).ldelim();
    }
    if (message.close_carrier !== undefined) {
      Command_CloseCarrier.encode(message.close_carrier, writer.uint32(18).fork()).ldelim();
    }
    if (message.start_read !== undefined) {
      Command_StartRead.encode(message.start_read, writer.uint32(26).fork()).ldelim();
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

          message.open_carrier = Command_OpenCarrier.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.close_carrier = Command_CloseCarrier.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.start_read = Command_StartRead.decode(reader, reader.uint32());
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
      open_carrier: isSet(object.open_carrier) ? Command_OpenCarrier.fromJSON(object.open_carrier) : undefined,
      close_carrier: isSet(object.close_carrier) ? Command_CloseCarrier.fromJSON(object.close_carrier) : undefined,
      start_read: isSet(object.start_read) ? Command_StartRead.fromJSON(object.start_read) : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.open_carrier !== undefined &&
      (obj.open_carrier = message.open_carrier ? Command_OpenCarrier.toJSON(message.open_carrier) : undefined);
    message.close_carrier !== undefined &&
      (obj.close_carrier = message.close_carrier ? Command_CloseCarrier.toJSON(message.close_carrier) : undefined);
    message.start_read !== undefined &&
      (obj.start_read = message.start_read ? Command_StartRead.toJSON(message.start_read) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.open_carrier = (object.open_carrier !== undefined && object.open_carrier !== null)
      ? Command_OpenCarrier.fromPartial(object.open_carrier)
      : undefined;
    message.close_carrier = (object.close_carrier !== undefined && object.close_carrier !== null)
      ? Command_CloseCarrier.fromPartial(object.close_carrier)
      : undefined;
    message.start_read = (object.start_read !== undefined && object.start_read !== null)
      ? Command_StartRead.fromPartial(object.start_read)
      : undefined;
    return message;
  },
};

function createBaseCommand_OpenCarrier(): Command_OpenCarrier {
  return {};
}

export const Command_OpenCarrier = {
  encode(_: Command_OpenCarrier, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_OpenCarrier {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_OpenCarrier();
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

  fromJSON(_: any): Command_OpenCarrier {
    return {};
  },

  toJSON(_: Command_OpenCarrier): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_OpenCarrier>, I>>(base?: I): Command_OpenCarrier {
    return Command_OpenCarrier.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_OpenCarrier>, I>>(_: I): Command_OpenCarrier {
    const message = createBaseCommand_OpenCarrier();
    return message;
  },
};

function createBaseCommand_CloseCarrier(): Command_CloseCarrier {
  return {};
}

export const Command_CloseCarrier = {
  encode(_: Command_CloseCarrier, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_CloseCarrier {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_CloseCarrier();
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

  fromJSON(_: any): Command_CloseCarrier {
    return {};
  },

  toJSON(_: Command_CloseCarrier): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_CloseCarrier>, I>>(base?: I): Command_CloseCarrier {
    return Command_CloseCarrier.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_CloseCarrier>, I>>(_: I): Command_CloseCarrier {
    const message = createBaseCommand_CloseCarrier();
    return message;
  },
};

function createBaseCommand_StartRead(): Command_StartRead {
  return { protocol_file: "", experiment_name: undefined, well_addresses: [] };
}

export const Command_StartRead = {
  encode(message: Command_StartRead, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.protocol_file !== "") {
      writer.uint32(10).string(message.protocol_file);
    }
    if (message.experiment_name !== undefined) {
      writer.uint32(18).string(message.experiment_name);
    }
    for (const v of message.well_addresses) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_StartRead {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_StartRead();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.protocol_file = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.experiment_name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.well_addresses.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_StartRead {
    return {
      protocol_file: isSet(object.protocol_file) ? String(object.protocol_file) : "",
      experiment_name: isSet(object.experiment_name) ? String(object.experiment_name) : undefined,
      well_addresses: Array.isArray(object?.well_addresses) ? object.well_addresses.map((e: any) => String(e)) : [],
    };
  },

  toJSON(message: Command_StartRead): unknown {
    const obj: any = {};
    message.protocol_file !== undefined && (obj.protocol_file = message.protocol_file);
    message.experiment_name !== undefined && (obj.experiment_name = message.experiment_name);
    if (message.well_addresses) {
      obj.well_addresses = message.well_addresses.map((e) => e);
    } else {
      obj.well_addresses = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_StartRead>, I>>(base?: I): Command_StartRead {
    return Command_StartRead.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_StartRead>, I>>(object: I): Command_StartRead {
    const message = createBaseCommand_StartRead();
    message.protocol_file = object.protocol_file ?? "";
    message.experiment_name = object.experiment_name ?? undefined;
    message.well_addresses = object.well_addresses?.map((e) => e) || [];
    return message;
  },
};

function createBaseConfig(): Config {
  return { protocol_dir: "", experiment_dir: "", reader_type: Config_CytationReaderType.CYTATION_UNKNOWN, tool_id: "" };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.protocol_dir !== "") {
      writer.uint32(10).string(message.protocol_dir);
    }
    if (message.experiment_dir !== "") {
      writer.uint32(18).string(message.experiment_dir);
    }
    if (message.reader_type !== Config_CytationReaderType.CYTATION_UNKNOWN) {
      writer.uint32(24).int32(config_CytationReaderTypeToNumber(message.reader_type));
    }
    if (message.tool_id !== "") {
      writer.uint32(34).string(message.tool_id);
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

          message.protocol_dir = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.experiment_dir = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.reader_type = config_CytationReaderTypeFromJSON(reader.int32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.tool_id = reader.string();
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
      protocol_dir: isSet(object.protocol_dir) ? String(object.protocol_dir) : "",
      experiment_dir: isSet(object.experiment_dir) ? String(object.experiment_dir) : "",
      reader_type: isSet(object.reader_type)
        ? config_CytationReaderTypeFromJSON(object.reader_type)
        : Config_CytationReaderType.CYTATION_UNKNOWN,
      tool_id: isSet(object.tool_id) ? String(object.tool_id) : "",
    };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.protocol_dir !== undefined && (obj.protocol_dir = message.protocol_dir);
    message.experiment_dir !== undefined && (obj.experiment_dir = message.experiment_dir);
    message.reader_type !== undefined && (obj.reader_type = config_CytationReaderTypeToJSON(message.reader_type));
    message.tool_id !== undefined && (obj.tool_id = message.tool_id);
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.protocol_dir = object.protocol_dir ?? "";
    message.experiment_dir = object.experiment_dir ?? "";
    message.reader_type = object.reader_type ?? Config_CytationReaderType.CYTATION_UNKNOWN;
    message.tool_id = object.tool_id ?? "";
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
