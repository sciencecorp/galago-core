/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Struct } from "../../google/protobuf/struct";
import { Command as Command14, Config as Config32 } from "./alps3000";
import { Command as Command7, Config as Config25 } from "./bioshake";
import { Command as Command9, Config as Config27 } from "./bravo";
import { Command as Command1, Config as Config19 } from "./cytation";
import { Command as Command5, Config as Config23 } from "./dataman70";
import { Command as Command16, Config as Config34 } from "./hamilton";
import { Command as Command8, Config as Config26 } from "./hig_centrifuge";
import { Command as Command4, Config as Config22 } from "./liconic";
import { Command as Command17, Config as Config35 } from "./microserve";
import { Command as Command10, Config as Config28 } from "./multidrop";
import { Command as Command2, Config as Config20 } from "./opentrons2";
import { Command as Command3, Config as Config21 } from "./pf400";
import { Command as Command12, Config as Config30 } from "./plateloc";
import { Command as Command6, Config as Config24 } from "./spectramax";
import { Command as Command15, Config as Config33 } from "./toolbox";
import { Command as Command11, Config as Config29 } from "./vcode";
import { Command as Command18, Config as Config36 } from "./vprep";
import { Command as Command13, Config as Config31 } from "./xpeel";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces";

export enum ResponseCode {
  UNKNOWN_RESPONSE = "UNKNOWN_RESPONSE",
  SUCCESS = "SUCCESS",
  WRONG_TOOL = "WRONG_TOOL",
  UNRECOGNIZED_COMMAND = "UNRECOGNIZED_COMMAND",
  INVALID_ARGUMENTS = "INVALID_ARGUMENTS",
  DRIVER_ERROR = "DRIVER_ERROR",
  NOT_READY = "NOT_READY",
  ERROR_FROM_TOOL = "ERROR_FROM_TOOL",
  UNRECOGNIZED = "UNRECOGNIZED",
}

export function responseCodeFromJSON(object: any): ResponseCode {
  switch (object) {
    case 0:
    case "UNKNOWN_RESPONSE":
      return ResponseCode.UNKNOWN_RESPONSE;
    case 1:
    case "SUCCESS":
      return ResponseCode.SUCCESS;
    case 2:
    case "WRONG_TOOL":
      return ResponseCode.WRONG_TOOL;
    case 3:
    case "UNRECOGNIZED_COMMAND":
      return ResponseCode.UNRECOGNIZED_COMMAND;
    case 4:
    case "INVALID_ARGUMENTS":
      return ResponseCode.INVALID_ARGUMENTS;
    case 5:
    case "DRIVER_ERROR":
      return ResponseCode.DRIVER_ERROR;
    case 6:
    case "NOT_READY":
      return ResponseCode.NOT_READY;
    case 7:
    case "ERROR_FROM_TOOL":
      return ResponseCode.ERROR_FROM_TOOL;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ResponseCode.UNRECOGNIZED;
  }
}

export function responseCodeToJSON(object: ResponseCode): string {
  switch (object) {
    case ResponseCode.UNKNOWN_RESPONSE:
      return "UNKNOWN_RESPONSE";
    case ResponseCode.SUCCESS:
      return "SUCCESS";
    case ResponseCode.WRONG_TOOL:
      return "WRONG_TOOL";
    case ResponseCode.UNRECOGNIZED_COMMAND:
      return "UNRECOGNIZED_COMMAND";
    case ResponseCode.INVALID_ARGUMENTS:
      return "INVALID_ARGUMENTS";
    case ResponseCode.DRIVER_ERROR:
      return "DRIVER_ERROR";
    case ResponseCode.NOT_READY:
      return "NOT_READY";
    case ResponseCode.ERROR_FROM_TOOL:
      return "ERROR_FROM_TOOL";
    case ResponseCode.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export function responseCodeToNumber(object: ResponseCode): number {
  switch (object) {
    case ResponseCode.UNKNOWN_RESPONSE:
      return 0;
    case ResponseCode.SUCCESS:
      return 1;
    case ResponseCode.WRONG_TOOL:
      return 2;
    case ResponseCode.UNRECOGNIZED_COMMAND:
      return 3;
    case ResponseCode.INVALID_ARGUMENTS:
      return 4;
    case ResponseCode.DRIVER_ERROR:
      return 5;
    case ResponseCode.NOT_READY:
      return 6;
    case ResponseCode.ERROR_FROM_TOOL:
      return 7;
    case ResponseCode.UNRECOGNIZED:
    default:
      return -1;
  }
}

export enum ToolStatus {
  UNKNOWN_STATUS = "UNKNOWN_STATUS",
  NOT_CONFIGURED = "NOT_CONFIGURED",
  INITIALIZING = "INITIALIZING",
  READY = "READY",
  BUSY = "BUSY",
  FAILED = "FAILED",
  OFFLINE = "OFFLINE",
  SIMULATED = "SIMULATED",
  UNRECOGNIZED = "UNRECOGNIZED",
}

export function toolStatusFromJSON(object: any): ToolStatus {
  switch (object) {
    case 0:
    case "UNKNOWN_STATUS":
      return ToolStatus.UNKNOWN_STATUS;
    case 1:
    case "NOT_CONFIGURED":
      return ToolStatus.NOT_CONFIGURED;
    case 2:
    case "INITIALIZING":
      return ToolStatus.INITIALIZING;
    case 3:
    case "READY":
      return ToolStatus.READY;
    case 4:
    case "BUSY":
      return ToolStatus.BUSY;
    case 5:
    case "FAILED":
      return ToolStatus.FAILED;
    case 6:
    case "OFFLINE":
      return ToolStatus.OFFLINE;
    case 7:
    case "SIMULATED":
      return ToolStatus.SIMULATED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ToolStatus.UNRECOGNIZED;
  }
}

export function toolStatusToJSON(object: ToolStatus): string {
  switch (object) {
    case ToolStatus.UNKNOWN_STATUS:
      return "UNKNOWN_STATUS";
    case ToolStatus.NOT_CONFIGURED:
      return "NOT_CONFIGURED";
    case ToolStatus.INITIALIZING:
      return "INITIALIZING";
    case ToolStatus.READY:
      return "READY";
    case ToolStatus.BUSY:
      return "BUSY";
    case ToolStatus.FAILED:
      return "FAILED";
    case ToolStatus.OFFLINE:
      return "OFFLINE";
    case ToolStatus.SIMULATED:
      return "SIMULATED";
    case ToolStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export function toolStatusToNumber(object: ToolStatus): number {
  switch (object) {
    case ToolStatus.UNKNOWN_STATUS:
      return 0;
    case ToolStatus.NOT_CONFIGURED:
      return 1;
    case ToolStatus.INITIALIZING:
      return 2;
    case ToolStatus.READY:
      return 3;
    case ToolStatus.BUSY:
      return 4;
    case ToolStatus.FAILED:
      return 5;
    case ToolStatus.OFFLINE:
      return 6;
    case ToolStatus.SIMULATED:
      return 7;
    case ToolStatus.UNRECOGNIZED:
    default:
      return -1;
  }
}

export interface Command {
  cytation?: Command1 | undefined;
  opentrons2?: Command2 | undefined;
  pf400?: Command3 | undefined;
  liconic?: Command4 | undefined;
  dataman70?: Command5 | undefined;
  spectramax?: Command6 | undefined;
  bioshake?: Command7 | undefined;
  hig_centrifuge?: Command8 | undefined;
  bravo?: Command9 | undefined;
  multidrop?: Command10 | undefined;
  vcode?: Command11 | undefined;
  plateloc?: Command12 | undefined;
  xpeel?: Command13 | undefined;
  alps3000?: Command14 | undefined;
  toolbox?: Command15 | undefined;
  hamilton?: Command16 | undefined;
  microserve?: Command17 | undefined;
  vprep?: Command18 | undefined;
}

export interface Config {
  simulated: boolean;
  cytation?: Config19 | undefined;
  opentrons2?: Config20 | undefined;
  pf400?: Config21 | undefined;
  liconic?: Config22 | undefined;
  dataman70?: Config23 | undefined;
  spectramax?: Config24 | undefined;
  bioshake?: Config25 | undefined;
  hig_centrifuge?: Config26 | undefined;
  bravo?: Config27 | undefined;
  multidrop?: Config28 | undefined;
  vcode?: Config29 | undefined;
  plateloc?: Config30 | undefined;
  xpeel?: Config31 | undefined;
  alps3000?: Config32 | undefined;
  toolbox?: Config33 | undefined;
  hamilton?: Config34 | undefined;
  microserve?: Config35 | undefined;
  vprep?: Config36 | undefined;
}

export interface ExecuteCommandReply {
  response: ResponseCode;
  error_message: string;
  return_reply: boolean;
  meta_data: { [key: string]: any } | undefined;
}

export interface EstimateDurationReply {
  response: ResponseCode;
  estimated_duration_seconds: number;
  error_message?: string | undefined;
}

export interface ConfigureReply {
  response: ResponseCode;
  error_message?: string | undefined;
}

export interface StatusReply {
  uptime: number;
  status: ToolStatus;
  error_message?: string | undefined;
}

function createBaseCommand(): Command {
  return {
    cytation: undefined,
    opentrons2: undefined,
    pf400: undefined,
    liconic: undefined,
    dataman70: undefined,
    spectramax: undefined,
    bioshake: undefined,
    hig_centrifuge: undefined,
    bravo: undefined,
    multidrop: undefined,
    vcode: undefined,
    plateloc: undefined,
    xpeel: undefined,
    alps3000: undefined,
    toolbox: undefined,
    hamilton: undefined,
    microserve: undefined,
    vprep: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.cytation !== undefined) {
      Command1.encode(message.cytation, writer.uint32(10).fork()).ldelim();
    }
    if (message.opentrons2 !== undefined) {
      Command2.encode(message.opentrons2, writer.uint32(18).fork()).ldelim();
    }
    if (message.pf400 !== undefined) {
      Command3.encode(message.pf400, writer.uint32(26).fork()).ldelim();
    }
    if (message.liconic !== undefined) {
      Command4.encode(message.liconic, writer.uint32(34).fork()).ldelim();
    }
    if (message.dataman70 !== undefined) {
      Command5.encode(message.dataman70, writer.uint32(42).fork()).ldelim();
    }
    if (message.spectramax !== undefined) {
      Command6.encode(message.spectramax, writer.uint32(50).fork()).ldelim();
    }
    if (message.bioshake !== undefined) {
      Command7.encode(message.bioshake, writer.uint32(58).fork()).ldelim();
    }
    if (message.hig_centrifuge !== undefined) {
      Command8.encode(message.hig_centrifuge, writer.uint32(66).fork()).ldelim();
    }
    if (message.bravo !== undefined) {
      Command9.encode(message.bravo, writer.uint32(74).fork()).ldelim();
    }
    if (message.multidrop !== undefined) {
      Command10.encode(message.multidrop, writer.uint32(82).fork()).ldelim();
    }
    if (message.vcode !== undefined) {
      Command11.encode(message.vcode, writer.uint32(90).fork()).ldelim();
    }
    if (message.plateloc !== undefined) {
      Command12.encode(message.plateloc, writer.uint32(98).fork()).ldelim();
    }
    if (message.xpeel !== undefined) {
      Command13.encode(message.xpeel, writer.uint32(106).fork()).ldelim();
    }
    if (message.alps3000 !== undefined) {
      Command14.encode(message.alps3000, writer.uint32(114).fork()).ldelim();
    }
    if (message.toolbox !== undefined) {
      Command15.encode(message.toolbox, writer.uint32(122).fork()).ldelim();
    }
    if (message.hamilton !== undefined) {
      Command16.encode(message.hamilton, writer.uint32(130).fork()).ldelim();
    }
    if (message.microserve !== undefined) {
      Command17.encode(message.microserve, writer.uint32(138).fork()).ldelim();
    }
    if (message.vprep !== undefined) {
      Command18.encode(message.vprep, writer.uint32(146).fork()).ldelim();
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

          message.cytation = Command1.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.opentrons2 = Command2.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.pf400 = Command3.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.liconic = Command4.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.dataman70 = Command5.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.spectramax = Command6.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.bioshake = Command7.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.hig_centrifuge = Command8.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.bravo = Command9.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.multidrop = Command10.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.vcode = Command11.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.plateloc = Command12.decode(reader, reader.uint32());
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.xpeel = Command13.decode(reader, reader.uint32());
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.alps3000 = Command14.decode(reader, reader.uint32());
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.toolbox = Command15.decode(reader, reader.uint32());
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.hamilton = Command16.decode(reader, reader.uint32());
          continue;
        case 17:
          if (tag !== 138) {
            break;
          }

          message.microserve = Command17.decode(reader, reader.uint32());
          continue;
        case 18:
          if (tag !== 146) {
            break;
          }

          message.vprep = Command18.decode(reader, reader.uint32());
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
      cytation: isSet(object.cytation) ? Command1.fromJSON(object.cytation) : undefined,
      opentrons2: isSet(object.opentrons2) ? Command2.fromJSON(object.opentrons2) : undefined,
      pf400: isSet(object.pf400) ? Command3.fromJSON(object.pf400) : undefined,
      liconic: isSet(object.liconic) ? Command4.fromJSON(object.liconic) : undefined,
      dataman70: isSet(object.dataman70) ? Command5.fromJSON(object.dataman70) : undefined,
      spectramax: isSet(object.spectramax) ? Command6.fromJSON(object.spectramax) : undefined,
      bioshake: isSet(object.bioshake) ? Command7.fromJSON(object.bioshake) : undefined,
      hig_centrifuge: isSet(object.hig_centrifuge) ? Command8.fromJSON(object.hig_centrifuge) : undefined,
      bravo: isSet(object.bravo) ? Command9.fromJSON(object.bravo) : undefined,
      multidrop: isSet(object.multidrop) ? Command10.fromJSON(object.multidrop) : undefined,
      vcode: isSet(object.vcode) ? Command11.fromJSON(object.vcode) : undefined,
      plateloc: isSet(object.plateloc) ? Command12.fromJSON(object.plateloc) : undefined,
      xpeel: isSet(object.xpeel) ? Command13.fromJSON(object.xpeel) : undefined,
      alps3000: isSet(object.alps3000) ? Command14.fromJSON(object.alps3000) : undefined,
      toolbox: isSet(object.toolbox) ? Command15.fromJSON(object.toolbox) : undefined,
      hamilton: isSet(object.hamilton) ? Command16.fromJSON(object.hamilton) : undefined,
      microserve: isSet(object.microserve) ? Command17.fromJSON(object.microserve) : undefined,
      vprep: isSet(object.vprep) ? Command18.fromJSON(object.vprep) : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.cytation !== undefined && (obj.cytation = message.cytation ? Command1.toJSON(message.cytation) : undefined);
    message.opentrons2 !== undefined &&
      (obj.opentrons2 = message.opentrons2 ? Command2.toJSON(message.opentrons2) : undefined);
    message.pf400 !== undefined && (obj.pf400 = message.pf400 ? Command3.toJSON(message.pf400) : undefined);
    message.liconic !== undefined && (obj.liconic = message.liconic ? Command4.toJSON(message.liconic) : undefined);
    message.dataman70 !== undefined &&
      (obj.dataman70 = message.dataman70 ? Command5.toJSON(message.dataman70) : undefined);
    message.spectramax !== undefined &&
      (obj.spectramax = message.spectramax ? Command6.toJSON(message.spectramax) : undefined);
    message.bioshake !== undefined && (obj.bioshake = message.bioshake ? Command7.toJSON(message.bioshake) : undefined);
    message.hig_centrifuge !== undefined &&
      (obj.hig_centrifuge = message.hig_centrifuge ? Command8.toJSON(message.hig_centrifuge) : undefined);
    message.bravo !== undefined && (obj.bravo = message.bravo ? Command9.toJSON(message.bravo) : undefined);
    message.multidrop !== undefined &&
      (obj.multidrop = message.multidrop ? Command10.toJSON(message.multidrop) : undefined);
    message.vcode !== undefined && (obj.vcode = message.vcode ? Command11.toJSON(message.vcode) : undefined);
    message.plateloc !== undefined &&
      (obj.plateloc = message.plateloc ? Command12.toJSON(message.plateloc) : undefined);
    message.xpeel !== undefined && (obj.xpeel = message.xpeel ? Command13.toJSON(message.xpeel) : undefined);
    message.alps3000 !== undefined &&
      (obj.alps3000 = message.alps3000 ? Command14.toJSON(message.alps3000) : undefined);
    message.toolbox !== undefined && (obj.toolbox = message.toolbox ? Command15.toJSON(message.toolbox) : undefined);
    message.hamilton !== undefined &&
      (obj.hamilton = message.hamilton ? Command16.toJSON(message.hamilton) : undefined);
    message.microserve !== undefined &&
      (obj.microserve = message.microserve ? Command17.toJSON(message.microserve) : undefined);
    message.vprep !== undefined && (obj.vprep = message.vprep ? Command18.toJSON(message.vprep) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.cytation = (object.cytation !== undefined && object.cytation !== null)
      ? Command1.fromPartial(object.cytation)
      : undefined;
    message.opentrons2 = (object.opentrons2 !== undefined && object.opentrons2 !== null)
      ? Command2.fromPartial(object.opentrons2)
      : undefined;
    message.pf400 = (object.pf400 !== undefined && object.pf400 !== null)
      ? Command3.fromPartial(object.pf400)
      : undefined;
    message.liconic = (object.liconic !== undefined && object.liconic !== null)
      ? Command4.fromPartial(object.liconic)
      : undefined;
    message.dataman70 = (object.dataman70 !== undefined && object.dataman70 !== null)
      ? Command5.fromPartial(object.dataman70)
      : undefined;
    message.spectramax = (object.spectramax !== undefined && object.spectramax !== null)
      ? Command6.fromPartial(object.spectramax)
      : undefined;
    message.bioshake = (object.bioshake !== undefined && object.bioshake !== null)
      ? Command7.fromPartial(object.bioshake)
      : undefined;
    message.hig_centrifuge = (object.hig_centrifuge !== undefined && object.hig_centrifuge !== null)
      ? Command8.fromPartial(object.hig_centrifuge)
      : undefined;
    message.bravo = (object.bravo !== undefined && object.bravo !== null)
      ? Command9.fromPartial(object.bravo)
      : undefined;
    message.multidrop = (object.multidrop !== undefined && object.multidrop !== null)
      ? Command10.fromPartial(object.multidrop)
      : undefined;
    message.vcode = (object.vcode !== undefined && object.vcode !== null)
      ? Command11.fromPartial(object.vcode)
      : undefined;
    message.plateloc = (object.plateloc !== undefined && object.plateloc !== null)
      ? Command12.fromPartial(object.plateloc)
      : undefined;
    message.xpeel = (object.xpeel !== undefined && object.xpeel !== null)
      ? Command13.fromPartial(object.xpeel)
      : undefined;
    message.alps3000 = (object.alps3000 !== undefined && object.alps3000 !== null)
      ? Command14.fromPartial(object.alps3000)
      : undefined;
    message.toolbox = (object.toolbox !== undefined && object.toolbox !== null)
      ? Command15.fromPartial(object.toolbox)
      : undefined;
    message.hamilton = (object.hamilton !== undefined && object.hamilton !== null)
      ? Command16.fromPartial(object.hamilton)
      : undefined;
    message.microserve = (object.microserve !== undefined && object.microserve !== null)
      ? Command17.fromPartial(object.microserve)
      : undefined;
    message.vprep = (object.vprep !== undefined && object.vprep !== null)
      ? Command18.fromPartial(object.vprep)
      : undefined;
    return message;
  },
};

function createBaseConfig(): Config {
  return {
    simulated: false,
    cytation: undefined,
    opentrons2: undefined,
    pf400: undefined,
    liconic: undefined,
    dataman70: undefined,
    spectramax: undefined,
    bioshake: undefined,
    hig_centrifuge: undefined,
    bravo: undefined,
    multidrop: undefined,
    vcode: undefined,
    plateloc: undefined,
    xpeel: undefined,
    alps3000: undefined,
    toolbox: undefined,
    hamilton: undefined,
    microserve: undefined,
    vprep: undefined,
  };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.simulated === true) {
      writer.uint32(8).bool(message.simulated);
    }
    if (message.cytation !== undefined) {
      Config19.encode(message.cytation, writer.uint32(162).fork()).ldelim();
    }
    if (message.opentrons2 !== undefined) {
      Config20.encode(message.opentrons2, writer.uint32(170).fork()).ldelim();
    }
    if (message.pf400 !== undefined) {
      Config21.encode(message.pf400, writer.uint32(178).fork()).ldelim();
    }
    if (message.liconic !== undefined) {
      Config22.encode(message.liconic, writer.uint32(186).fork()).ldelim();
    }
    if (message.dataman70 !== undefined) {
      Config23.encode(message.dataman70, writer.uint32(194).fork()).ldelim();
    }
    if (message.spectramax !== undefined) {
      Config24.encode(message.spectramax, writer.uint32(202).fork()).ldelim();
    }
    if (message.bioshake !== undefined) {
      Config25.encode(message.bioshake, writer.uint32(210).fork()).ldelim();
    }
    if (message.hig_centrifuge !== undefined) {
      Config26.encode(message.hig_centrifuge, writer.uint32(218).fork()).ldelim();
    }
    if (message.bravo !== undefined) {
      Config27.encode(message.bravo, writer.uint32(226).fork()).ldelim();
    }
    if (message.multidrop !== undefined) {
      Config28.encode(message.multidrop, writer.uint32(234).fork()).ldelim();
    }
    if (message.vcode !== undefined) {
      Config29.encode(message.vcode, writer.uint32(242).fork()).ldelim();
    }
    if (message.plateloc !== undefined) {
      Config30.encode(message.plateloc, writer.uint32(250).fork()).ldelim();
    }
    if (message.xpeel !== undefined) {
      Config31.encode(message.xpeel, writer.uint32(258).fork()).ldelim();
    }
    if (message.alps3000 !== undefined) {
      Config32.encode(message.alps3000, writer.uint32(266).fork()).ldelim();
    }
    if (message.toolbox !== undefined) {
      Config33.encode(message.toolbox, writer.uint32(274).fork()).ldelim();
    }
    if (message.hamilton !== undefined) {
      Config34.encode(message.hamilton, writer.uint32(282).fork()).ldelim();
    }
    if (message.microserve !== undefined) {
      Config35.encode(message.microserve, writer.uint32(290).fork()).ldelim();
    }
    if (message.vprep !== undefined) {
      Config36.encode(message.vprep, writer.uint32(298).fork()).ldelim();
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
          if (tag !== 8) {
            break;
          }

          message.simulated = reader.bool();
          continue;
        case 20:
          if (tag !== 162) {
            break;
          }

          message.cytation = Config19.decode(reader, reader.uint32());
          continue;
        case 21:
          if (tag !== 170) {
            break;
          }

          message.opentrons2 = Config20.decode(reader, reader.uint32());
          continue;
        case 22:
          if (tag !== 178) {
            break;
          }

          message.pf400 = Config21.decode(reader, reader.uint32());
          continue;
        case 23:
          if (tag !== 186) {
            break;
          }

          message.liconic = Config22.decode(reader, reader.uint32());
          continue;
        case 24:
          if (tag !== 194) {
            break;
          }

          message.dataman70 = Config23.decode(reader, reader.uint32());
          continue;
        case 25:
          if (tag !== 202) {
            break;
          }

          message.spectramax = Config24.decode(reader, reader.uint32());
          continue;
        case 26:
          if (tag !== 210) {
            break;
          }

          message.bioshake = Config25.decode(reader, reader.uint32());
          continue;
        case 27:
          if (tag !== 218) {
            break;
          }

          message.hig_centrifuge = Config26.decode(reader, reader.uint32());
          continue;
        case 28:
          if (tag !== 226) {
            break;
          }

          message.bravo = Config27.decode(reader, reader.uint32());
          continue;
        case 29:
          if (tag !== 234) {
            break;
          }

          message.multidrop = Config28.decode(reader, reader.uint32());
          continue;
        case 30:
          if (tag !== 242) {
            break;
          }

          message.vcode = Config29.decode(reader, reader.uint32());
          continue;
        case 31:
          if (tag !== 250) {
            break;
          }

          message.plateloc = Config30.decode(reader, reader.uint32());
          continue;
        case 32:
          if (tag !== 258) {
            break;
          }

          message.xpeel = Config31.decode(reader, reader.uint32());
          continue;
        case 33:
          if (tag !== 266) {
            break;
          }

          message.alps3000 = Config32.decode(reader, reader.uint32());
          continue;
        case 34:
          if (tag !== 274) {
            break;
          }

          message.toolbox = Config33.decode(reader, reader.uint32());
          continue;
        case 35:
          if (tag !== 282) {
            break;
          }

          message.hamilton = Config34.decode(reader, reader.uint32());
          continue;
        case 36:
          if (tag !== 290) {
            break;
          }

          message.microserve = Config35.decode(reader, reader.uint32());
          continue;
        case 37:
          if (tag !== 298) {
            break;
          }

          message.vprep = Config36.decode(reader, reader.uint32());
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
      simulated: isSet(object.simulated) ? Boolean(object.simulated) : false,
      cytation: isSet(object.cytation) ? Config19.fromJSON(object.cytation) : undefined,
      opentrons2: isSet(object.opentrons2) ? Config20.fromJSON(object.opentrons2) : undefined,
      pf400: isSet(object.pf400) ? Config21.fromJSON(object.pf400) : undefined,
      liconic: isSet(object.liconic) ? Config22.fromJSON(object.liconic) : undefined,
      dataman70: isSet(object.dataman70) ? Config23.fromJSON(object.dataman70) : undefined,
      spectramax: isSet(object.spectramax) ? Config24.fromJSON(object.spectramax) : undefined,
      bioshake: isSet(object.bioshake) ? Config25.fromJSON(object.bioshake) : undefined,
      hig_centrifuge: isSet(object.hig_centrifuge) ? Config26.fromJSON(object.hig_centrifuge) : undefined,
      bravo: isSet(object.bravo) ? Config27.fromJSON(object.bravo) : undefined,
      multidrop: isSet(object.multidrop) ? Config28.fromJSON(object.multidrop) : undefined,
      vcode: isSet(object.vcode) ? Config29.fromJSON(object.vcode) : undefined,
      plateloc: isSet(object.plateloc) ? Config30.fromJSON(object.plateloc) : undefined,
      xpeel: isSet(object.xpeel) ? Config31.fromJSON(object.xpeel) : undefined,
      alps3000: isSet(object.alps3000) ? Config32.fromJSON(object.alps3000) : undefined,
      toolbox: isSet(object.toolbox) ? Config33.fromJSON(object.toolbox) : undefined,
      hamilton: isSet(object.hamilton) ? Config34.fromJSON(object.hamilton) : undefined,
      microserve: isSet(object.microserve) ? Config35.fromJSON(object.microserve) : undefined,
      vprep: isSet(object.vprep) ? Config36.fromJSON(object.vprep) : undefined,
    };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.simulated !== undefined && (obj.simulated = message.simulated);
    message.cytation !== undefined && (obj.cytation = message.cytation ? Config19.toJSON(message.cytation) : undefined);
    message.opentrons2 !== undefined &&
      (obj.opentrons2 = message.opentrons2 ? Config20.toJSON(message.opentrons2) : undefined);
    message.pf400 !== undefined && (obj.pf400 = message.pf400 ? Config21.toJSON(message.pf400) : undefined);
    message.liconic !== undefined && (obj.liconic = message.liconic ? Config22.toJSON(message.liconic) : undefined);
    message.dataman70 !== undefined &&
      (obj.dataman70 = message.dataman70 ? Config23.toJSON(message.dataman70) : undefined);
    message.spectramax !== undefined &&
      (obj.spectramax = message.spectramax ? Config24.toJSON(message.spectramax) : undefined);
    message.bioshake !== undefined && (obj.bioshake = message.bioshake ? Config25.toJSON(message.bioshake) : undefined);
    message.hig_centrifuge !== undefined &&
      (obj.hig_centrifuge = message.hig_centrifuge ? Config26.toJSON(message.hig_centrifuge) : undefined);
    message.bravo !== undefined && (obj.bravo = message.bravo ? Config27.toJSON(message.bravo) : undefined);
    message.multidrop !== undefined &&
      (obj.multidrop = message.multidrop ? Config28.toJSON(message.multidrop) : undefined);
    message.vcode !== undefined && (obj.vcode = message.vcode ? Config29.toJSON(message.vcode) : undefined);
    message.plateloc !== undefined && (obj.plateloc = message.plateloc ? Config30.toJSON(message.plateloc) : undefined);
    message.xpeel !== undefined && (obj.xpeel = message.xpeel ? Config31.toJSON(message.xpeel) : undefined);
    message.alps3000 !== undefined && (obj.alps3000 = message.alps3000 ? Config32.toJSON(message.alps3000) : undefined);
    message.toolbox !== undefined && (obj.toolbox = message.toolbox ? Config33.toJSON(message.toolbox) : undefined);
    message.hamilton !== undefined && (obj.hamilton = message.hamilton ? Config34.toJSON(message.hamilton) : undefined);
    message.microserve !== undefined &&
      (obj.microserve = message.microserve ? Config35.toJSON(message.microserve) : undefined);
    message.vprep !== undefined && (obj.vprep = message.vprep ? Config36.toJSON(message.vprep) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.simulated = object.simulated ?? false;
    message.cytation = (object.cytation !== undefined && object.cytation !== null)
      ? Config19.fromPartial(object.cytation)
      : undefined;
    message.opentrons2 = (object.opentrons2 !== undefined && object.opentrons2 !== null)
      ? Config20.fromPartial(object.opentrons2)
      : undefined;
    message.pf400 = (object.pf400 !== undefined && object.pf400 !== null)
      ? Config21.fromPartial(object.pf400)
      : undefined;
    message.liconic = (object.liconic !== undefined && object.liconic !== null)
      ? Config22.fromPartial(object.liconic)
      : undefined;
    message.dataman70 = (object.dataman70 !== undefined && object.dataman70 !== null)
      ? Config23.fromPartial(object.dataman70)
      : undefined;
    message.spectramax = (object.spectramax !== undefined && object.spectramax !== null)
      ? Config24.fromPartial(object.spectramax)
      : undefined;
    message.bioshake = (object.bioshake !== undefined && object.bioshake !== null)
      ? Config25.fromPartial(object.bioshake)
      : undefined;
    message.hig_centrifuge = (object.hig_centrifuge !== undefined && object.hig_centrifuge !== null)
      ? Config26.fromPartial(object.hig_centrifuge)
      : undefined;
    message.bravo = (object.bravo !== undefined && object.bravo !== null)
      ? Config27.fromPartial(object.bravo)
      : undefined;
    message.multidrop = (object.multidrop !== undefined && object.multidrop !== null)
      ? Config28.fromPartial(object.multidrop)
      : undefined;
    message.vcode = (object.vcode !== undefined && object.vcode !== null)
      ? Config29.fromPartial(object.vcode)
      : undefined;
    message.plateloc = (object.plateloc !== undefined && object.plateloc !== null)
      ? Config30.fromPartial(object.plateloc)
      : undefined;
    message.xpeel = (object.xpeel !== undefined && object.xpeel !== null)
      ? Config31.fromPartial(object.xpeel)
      : undefined;
    message.alps3000 = (object.alps3000 !== undefined && object.alps3000 !== null)
      ? Config32.fromPartial(object.alps3000)
      : undefined;
    message.toolbox = (object.toolbox !== undefined && object.toolbox !== null)
      ? Config33.fromPartial(object.toolbox)
      : undefined;
    message.hamilton = (object.hamilton !== undefined && object.hamilton !== null)
      ? Config34.fromPartial(object.hamilton)
      : undefined;
    message.microserve = (object.microserve !== undefined && object.microserve !== null)
      ? Config35.fromPartial(object.microserve)
      : undefined;
    message.vprep = (object.vprep !== undefined && object.vprep !== null)
      ? Config36.fromPartial(object.vprep)
      : undefined;
    return message;
  },
};

function createBaseExecuteCommandReply(): ExecuteCommandReply {
  return { response: ResponseCode.UNKNOWN_RESPONSE, error_message: "", return_reply: false, meta_data: undefined };
}

export const ExecuteCommandReply = {
  encode(message: ExecuteCommandReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.response !== ResponseCode.UNKNOWN_RESPONSE) {
      writer.uint32(8).int32(responseCodeToNumber(message.response));
    }
    if (message.error_message !== "") {
      writer.uint32(18).string(message.error_message);
    }
    if (message.return_reply === true) {
      writer.uint32(24).bool(message.return_reply);
    }
    if (message.meta_data !== undefined) {
      Struct.encode(Struct.wrap(message.meta_data), writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ExecuteCommandReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExecuteCommandReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.response = responseCodeFromJSON(reader.int32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.error_message = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.return_reply = reader.bool();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.meta_data = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ExecuteCommandReply {
    return {
      response: isSet(object.response) ? responseCodeFromJSON(object.response) : ResponseCode.UNKNOWN_RESPONSE,
      error_message: isSet(object.error_message) ? String(object.error_message) : "",
      return_reply: isSet(object.return_reply) ? Boolean(object.return_reply) : false,
      meta_data: isObject(object.meta_data) ? object.meta_data : undefined,
    };
  },

  toJSON(message: ExecuteCommandReply): unknown {
    const obj: any = {};
    message.response !== undefined && (obj.response = responseCodeToJSON(message.response));
    message.error_message !== undefined && (obj.error_message = message.error_message);
    message.return_reply !== undefined && (obj.return_reply = message.return_reply);
    message.meta_data !== undefined && (obj.meta_data = message.meta_data);
    return obj;
  },

  create<I extends Exact<DeepPartial<ExecuteCommandReply>, I>>(base?: I): ExecuteCommandReply {
    return ExecuteCommandReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ExecuteCommandReply>, I>>(object: I): ExecuteCommandReply {
    const message = createBaseExecuteCommandReply();
    message.response = object.response ?? ResponseCode.UNKNOWN_RESPONSE;
    message.error_message = object.error_message ?? "";
    message.return_reply = object.return_reply ?? false;
    message.meta_data = object.meta_data ?? undefined;
    return message;
  },
};

function createBaseEstimateDurationReply(): EstimateDurationReply {
  return { response: ResponseCode.UNKNOWN_RESPONSE, estimated_duration_seconds: 0, error_message: undefined };
}

export const EstimateDurationReply = {
  encode(message: EstimateDurationReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.response !== ResponseCode.UNKNOWN_RESPONSE) {
      writer.uint32(8).int32(responseCodeToNumber(message.response));
    }
    if (message.estimated_duration_seconds !== 0) {
      writer.uint32(16).int32(message.estimated_duration_seconds);
    }
    if (message.error_message !== undefined) {
      writer.uint32(26).string(message.error_message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EstimateDurationReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEstimateDurationReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.response = responseCodeFromJSON(reader.int32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.estimated_duration_seconds = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
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

  fromJSON(object: any): EstimateDurationReply {
    return {
      response: isSet(object.response) ? responseCodeFromJSON(object.response) : ResponseCode.UNKNOWN_RESPONSE,
      estimated_duration_seconds: isSet(object.estimated_duration_seconds)
        ? Number(object.estimated_duration_seconds)
        : 0,
      error_message: isSet(object.error_message) ? String(object.error_message) : undefined,
    };
  },

  toJSON(message: EstimateDurationReply): unknown {
    const obj: any = {};
    message.response !== undefined && (obj.response = responseCodeToJSON(message.response));
    message.estimated_duration_seconds !== undefined &&
      (obj.estimated_duration_seconds = Math.round(message.estimated_duration_seconds));
    message.error_message !== undefined && (obj.error_message = message.error_message);
    return obj;
  },

  create<I extends Exact<DeepPartial<EstimateDurationReply>, I>>(base?: I): EstimateDurationReply {
    return EstimateDurationReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EstimateDurationReply>, I>>(object: I): EstimateDurationReply {
    const message = createBaseEstimateDurationReply();
    message.response = object.response ?? ResponseCode.UNKNOWN_RESPONSE;
    message.estimated_duration_seconds = object.estimated_duration_seconds ?? 0;
    message.error_message = object.error_message ?? undefined;
    return message;
  },
};

function createBaseConfigureReply(): ConfigureReply {
  return { response: ResponseCode.UNKNOWN_RESPONSE, error_message: undefined };
}

export const ConfigureReply = {
  encode(message: ConfigureReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.response !== ResponseCode.UNKNOWN_RESPONSE) {
      writer.uint32(8).int32(responseCodeToNumber(message.response));
    }
    if (message.error_message !== undefined) {
      writer.uint32(18).string(message.error_message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ConfigureReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConfigureReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.response = responseCodeFromJSON(reader.int32());
          continue;
        case 2:
          if (tag !== 18) {
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

  fromJSON(object: any): ConfigureReply {
    return {
      response: isSet(object.response) ? responseCodeFromJSON(object.response) : ResponseCode.UNKNOWN_RESPONSE,
      error_message: isSet(object.error_message) ? String(object.error_message) : undefined,
    };
  },

  toJSON(message: ConfigureReply): unknown {
    const obj: any = {};
    message.response !== undefined && (obj.response = responseCodeToJSON(message.response));
    message.error_message !== undefined && (obj.error_message = message.error_message);
    return obj;
  },

  create<I extends Exact<DeepPartial<ConfigureReply>, I>>(base?: I): ConfigureReply {
    return ConfigureReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ConfigureReply>, I>>(object: I): ConfigureReply {
    const message = createBaseConfigureReply();
    message.response = object.response ?? ResponseCode.UNKNOWN_RESPONSE;
    message.error_message = object.error_message ?? undefined;
    return message;
  },
};

function createBaseStatusReply(): StatusReply {
  return { uptime: 0, status: ToolStatus.UNKNOWN_STATUS, error_message: undefined };
}

export const StatusReply = {
  encode(message: StatusReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.uptime !== 0) {
      writer.uint32(8).int32(message.uptime);
    }
    if (message.status !== ToolStatus.UNKNOWN_STATUS) {
      writer.uint32(16).int32(toolStatusToNumber(message.status));
    }
    if (message.error_message !== undefined) {
      writer.uint32(26).string(message.error_message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StatusReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStatusReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.uptime = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.status = toolStatusFromJSON(reader.int32());
          continue;
        case 3:
          if (tag !== 26) {
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

  fromJSON(object: any): StatusReply {
    return {
      uptime: isSet(object.uptime) ? Number(object.uptime) : 0,
      status: isSet(object.status) ? toolStatusFromJSON(object.status) : ToolStatus.UNKNOWN_STATUS,
      error_message: isSet(object.error_message) ? String(object.error_message) : undefined,
    };
  },

  toJSON(message: StatusReply): unknown {
    const obj: any = {};
    message.uptime !== undefined && (obj.uptime = Math.round(message.uptime));
    message.status !== undefined && (obj.status = toolStatusToJSON(message.status));
    message.error_message !== undefined && (obj.error_message = message.error_message);
    return obj;
  },

  create<I extends Exact<DeepPartial<StatusReply>, I>>(base?: I): StatusReply {
    return StatusReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StatusReply>, I>>(object: I): StatusReply {
    const message = createBaseStatusReply();
    message.uptime = object.uptime ?? 0;
    message.status = object.status ?? ToolStatus.UNKNOWN_STATUS;
    message.error_message = object.error_message ?? undefined;
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
