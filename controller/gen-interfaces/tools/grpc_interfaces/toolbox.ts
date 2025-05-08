/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Struct } from "../../google/protobuf/struct";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.toolbox";

export interface Command {
  timer?: Command_Timer | undefined;
  user_message?: Command_UserMessage | undefined;
  show_image?: Command_ShowImage | undefined;
  slack_message?: Command_SlackMessage | undefined;
  send_email?: Command_SendEmail | undefined;
  text_to_speech?: Command_TextToSpeech | undefined;
  get_workcells?: Command_GetWorkcells | undefined;
  log_media_exchange?: Command_LogMediaExchange | undefined;
  get_liconic_sensor_data?: Command_GetLiconicSensorData | undefined;
  get_ot2_images_by_date?: Command_GetOT2ImagesByDate | undefined;
  get_ot2_image_bytes?: Command_GetOT2ImageBytes | undefined;
  get_ot2_image_prediction?: Command_GetOT2ImagePrediction | undefined;
  run_script?: Command_RunScript | undefined;
  send_slack_alert?: Command_SendSlackAlert | undefined;
  clear_last_slack_alert?: Command_ClearLastSlackAlert | undefined;
  get_log_media_exchange_by_date?: Command_GetLogMediaExchangeByDate | undefined;
  validate_folder?: Command_ValidateFolder | undefined;
  write_to_json?: Command_WriteToJson | undefined;
}

export interface Command_WriteToJson {
  struct_object: { [key: string]: any } | undefined;
  file_path: string;
}

export interface Command_Timer {
  time_seconds: number;
  message?: string | undefined;
}

export interface Command_UserMessage {
  message: string;
  title: string;
  message_type: string;
}

export interface Command_ShowImage {
  file: string;
  title?: string | undefined;
  width?: number | undefined;
  height?: number | undefined;
}

export interface Command_SlackMessage {
  message: string;
}

export interface Command_SendEmail {
  recipients?: string | undefined;
  message: string;
  subject: string;
}

export interface Command_TextToSpeech {
  text: string;
}

export interface Command_GetWorkcells {
}

export interface Command_LogMediaExchange {
  source_barcode: string;
  destination_name: string;
  destination_barcode: string;
  source_wells: string[];
  percent_exchange: number;
  new_tips: boolean;
}

export interface Command_GetLogMediaExchangeByDate {
  date: string;
}

export interface Command_GetLiconicSensorData {
  tool_id: string;
  date: string;
}

export interface Command_GetOT2ImagesByDate {
  date: string;
}

export interface Command_GetOT2ImageBytes {
  date: string;
  image_file: string;
}

export interface Command_ImageResponse {
  image_data: Uint8Array;
}

export interface Command_GetOT2ImagePrediction {
  date: string;
  image_file: string;
}

export interface Command_RunScript {
  name: string;
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
    timer: undefined,
    user_message: undefined,
    show_image: undefined,
    slack_message: undefined,
    send_email: undefined,
    text_to_speech: undefined,
    get_workcells: undefined,
    log_media_exchange: undefined,
    get_liconic_sensor_data: undefined,
    get_ot2_images_by_date: undefined,
    get_ot2_image_bytes: undefined,
    get_ot2_image_prediction: undefined,
    run_script: undefined,
    send_slack_alert: undefined,
    clear_last_slack_alert: undefined,
    get_log_media_exchange_by_date: undefined,
    validate_folder: undefined,
    write_to_json: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.timer !== undefined) {
      Command_Timer.encode(message.timer, writer.uint32(10).fork()).ldelim();
    }
    if (message.user_message !== undefined) {
      Command_UserMessage.encode(message.user_message, writer.uint32(18).fork()).ldelim();
    }
    if (message.show_image !== undefined) {
      Command_ShowImage.encode(message.show_image, writer.uint32(26).fork()).ldelim();
    }
    if (message.slack_message !== undefined) {
      Command_SlackMessage.encode(message.slack_message, writer.uint32(34).fork()).ldelim();
    }
    if (message.send_email !== undefined) {
      Command_SendEmail.encode(message.send_email, writer.uint32(42).fork()).ldelim();
    }
    if (message.text_to_speech !== undefined) {
      Command_TextToSpeech.encode(message.text_to_speech, writer.uint32(50).fork()).ldelim();
    }
    if (message.get_workcells !== undefined) {
      Command_GetWorkcells.encode(message.get_workcells, writer.uint32(58).fork()).ldelim();
    }
    if (message.log_media_exchange !== undefined) {
      Command_LogMediaExchange.encode(message.log_media_exchange, writer.uint32(66).fork()).ldelim();
    }
    if (message.get_liconic_sensor_data !== undefined) {
      Command_GetLiconicSensorData.encode(message.get_liconic_sensor_data, writer.uint32(74).fork()).ldelim();
    }
    if (message.get_ot2_images_by_date !== undefined) {
      Command_GetOT2ImagesByDate.encode(message.get_ot2_images_by_date, writer.uint32(82).fork()).ldelim();
    }
    if (message.get_ot2_image_bytes !== undefined) {
      Command_GetOT2ImageBytes.encode(message.get_ot2_image_bytes, writer.uint32(90).fork()).ldelim();
    }
    if (message.get_ot2_image_prediction !== undefined) {
      Command_GetOT2ImagePrediction.encode(message.get_ot2_image_prediction, writer.uint32(98).fork()).ldelim();
    }
    if (message.run_script !== undefined) {
      Command_RunScript.encode(message.run_script, writer.uint32(106).fork()).ldelim();
    }
    if (message.send_slack_alert !== undefined) {
      Command_SendSlackAlert.encode(message.send_slack_alert, writer.uint32(114).fork()).ldelim();
    }
    if (message.clear_last_slack_alert !== undefined) {
      Command_ClearLastSlackAlert.encode(message.clear_last_slack_alert, writer.uint32(122).fork()).ldelim();
    }
    if (message.get_log_media_exchange_by_date !== undefined) {
      Command_GetLogMediaExchangeByDate.encode(message.get_log_media_exchange_by_date, writer.uint32(130).fork())
        .ldelim();
    }
    if (message.validate_folder !== undefined) {
      Command_ValidateFolder.encode(message.validate_folder, writer.uint32(138).fork()).ldelim();
    }
    if (message.write_to_json !== undefined) {
      Command_WriteToJson.encode(message.write_to_json, writer.uint32(146).fork()).ldelim();
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

          message.timer = Command_Timer.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.user_message = Command_UserMessage.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.show_image = Command_ShowImage.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.slack_message = Command_SlackMessage.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.send_email = Command_SendEmail.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.text_to_speech = Command_TextToSpeech.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.get_workcells = Command_GetWorkcells.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.log_media_exchange = Command_LogMediaExchange.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.get_liconic_sensor_data = Command_GetLiconicSensorData.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.get_ot2_images_by_date = Command_GetOT2ImagesByDate.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.get_ot2_image_bytes = Command_GetOT2ImageBytes.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.get_ot2_image_prediction = Command_GetOT2ImagePrediction.decode(reader, reader.uint32());
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.run_script = Command_RunScript.decode(reader, reader.uint32());
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.send_slack_alert = Command_SendSlackAlert.decode(reader, reader.uint32());
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.clear_last_slack_alert = Command_ClearLastSlackAlert.decode(reader, reader.uint32());
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.get_log_media_exchange_by_date = Command_GetLogMediaExchangeByDate.decode(reader, reader.uint32());
          continue;
        case 17:
          if (tag !== 138) {
            break;
          }

          message.validate_folder = Command_ValidateFolder.decode(reader, reader.uint32());
          continue;
        case 18:
          if (tag !== 146) {
            break;
          }

          message.write_to_json = Command_WriteToJson.decode(reader, reader.uint32());
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
      timer: isSet(object.timer) ? Command_Timer.fromJSON(object.timer) : undefined,
      user_message: isSet(object.user_message) ? Command_UserMessage.fromJSON(object.user_message) : undefined,
      show_image: isSet(object.show_image) ? Command_ShowImage.fromJSON(object.show_image) : undefined,
      slack_message: isSet(object.slack_message) ? Command_SlackMessage.fromJSON(object.slack_message) : undefined,
      send_email: isSet(object.send_email) ? Command_SendEmail.fromJSON(object.send_email) : undefined,
      text_to_speech: isSet(object.text_to_speech) ? Command_TextToSpeech.fromJSON(object.text_to_speech) : undefined,
      get_workcells: isSet(object.get_workcells) ? Command_GetWorkcells.fromJSON(object.get_workcells) : undefined,
      log_media_exchange: isSet(object.log_media_exchange)
        ? Command_LogMediaExchange.fromJSON(object.log_media_exchange)
        : undefined,
      get_liconic_sensor_data: isSet(object.get_liconic_sensor_data)
        ? Command_GetLiconicSensorData.fromJSON(object.get_liconic_sensor_data)
        : undefined,
      get_ot2_images_by_date: isSet(object.get_ot2_images_by_date)
        ? Command_GetOT2ImagesByDate.fromJSON(object.get_ot2_images_by_date)
        : undefined,
      get_ot2_image_bytes: isSet(object.get_ot2_image_bytes)
        ? Command_GetOT2ImageBytes.fromJSON(object.get_ot2_image_bytes)
        : undefined,
      get_ot2_image_prediction: isSet(object.get_ot2_image_prediction)
        ? Command_GetOT2ImagePrediction.fromJSON(object.get_ot2_image_prediction)
        : undefined,
      run_script: isSet(object.run_script) ? Command_RunScript.fromJSON(object.run_script) : undefined,
      send_slack_alert: isSet(object.send_slack_alert)
        ? Command_SendSlackAlert.fromJSON(object.send_slack_alert)
        : undefined,
      clear_last_slack_alert: isSet(object.clear_last_slack_alert)
        ? Command_ClearLastSlackAlert.fromJSON(object.clear_last_slack_alert)
        : undefined,
      get_log_media_exchange_by_date: isSet(object.get_log_media_exchange_by_date)
        ? Command_GetLogMediaExchangeByDate.fromJSON(object.get_log_media_exchange_by_date)
        : undefined,
      validate_folder: isSet(object.validate_folder)
        ? Command_ValidateFolder.fromJSON(object.validate_folder)
        : undefined,
      write_to_json: isSet(object.write_to_json) ? Command_WriteToJson.fromJSON(object.write_to_json) : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.timer !== undefined && (obj.timer = message.timer ? Command_Timer.toJSON(message.timer) : undefined);
    message.user_message !== undefined &&
      (obj.user_message = message.user_message ? Command_UserMessage.toJSON(message.user_message) : undefined);
    message.show_image !== undefined &&
      (obj.show_image = message.show_image ? Command_ShowImage.toJSON(message.show_image) : undefined);
    message.slack_message !== undefined &&
      (obj.slack_message = message.slack_message ? Command_SlackMessage.toJSON(message.slack_message) : undefined);
    message.send_email !== undefined &&
      (obj.send_email = message.send_email ? Command_SendEmail.toJSON(message.send_email) : undefined);
    message.text_to_speech !== undefined &&
      (obj.text_to_speech = message.text_to_speech ? Command_TextToSpeech.toJSON(message.text_to_speech) : undefined);
    message.get_workcells !== undefined &&
      (obj.get_workcells = message.get_workcells ? Command_GetWorkcells.toJSON(message.get_workcells) : undefined);
    message.log_media_exchange !== undefined && (obj.log_media_exchange = message.log_media_exchange
      ? Command_LogMediaExchange.toJSON(message.log_media_exchange)
      : undefined);
    message.get_liconic_sensor_data !== undefined && (obj.get_liconic_sensor_data = message.get_liconic_sensor_data
      ? Command_GetLiconicSensorData.toJSON(message.get_liconic_sensor_data)
      : undefined);
    message.get_ot2_images_by_date !== undefined && (obj.get_ot2_images_by_date = message.get_ot2_images_by_date
      ? Command_GetOT2ImagesByDate.toJSON(message.get_ot2_images_by_date)
      : undefined);
    message.get_ot2_image_bytes !== undefined && (obj.get_ot2_image_bytes = message.get_ot2_image_bytes
      ? Command_GetOT2ImageBytes.toJSON(message.get_ot2_image_bytes)
      : undefined);
    message.get_ot2_image_prediction !== undefined && (obj.get_ot2_image_prediction = message.get_ot2_image_prediction
      ? Command_GetOT2ImagePrediction.toJSON(message.get_ot2_image_prediction)
      : undefined);
    message.run_script !== undefined &&
      (obj.run_script = message.run_script ? Command_RunScript.toJSON(message.run_script) : undefined);
    message.send_slack_alert !== undefined && (obj.send_slack_alert = message.send_slack_alert
      ? Command_SendSlackAlert.toJSON(message.send_slack_alert)
      : undefined);
    message.clear_last_slack_alert !== undefined && (obj.clear_last_slack_alert = message.clear_last_slack_alert
      ? Command_ClearLastSlackAlert.toJSON(message.clear_last_slack_alert)
      : undefined);
    message.get_log_media_exchange_by_date !== undefined &&
      (obj.get_log_media_exchange_by_date = message.get_log_media_exchange_by_date
        ? Command_GetLogMediaExchangeByDate.toJSON(message.get_log_media_exchange_by_date)
        : undefined);
    message.validate_folder !== undefined && (obj.validate_folder = message.validate_folder
      ? Command_ValidateFolder.toJSON(message.validate_folder)
      : undefined);
    message.write_to_json !== undefined &&
      (obj.write_to_json = message.write_to_json ? Command_WriteToJson.toJSON(message.write_to_json) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.timer = (object.timer !== undefined && object.timer !== null)
      ? Command_Timer.fromPartial(object.timer)
      : undefined;
    message.user_message = (object.user_message !== undefined && object.user_message !== null)
      ? Command_UserMessage.fromPartial(object.user_message)
      : undefined;
    message.show_image = (object.show_image !== undefined && object.show_image !== null)
      ? Command_ShowImage.fromPartial(object.show_image)
      : undefined;
    message.slack_message = (object.slack_message !== undefined && object.slack_message !== null)
      ? Command_SlackMessage.fromPartial(object.slack_message)
      : undefined;
    message.send_email = (object.send_email !== undefined && object.send_email !== null)
      ? Command_SendEmail.fromPartial(object.send_email)
      : undefined;
    message.text_to_speech = (object.text_to_speech !== undefined && object.text_to_speech !== null)
      ? Command_TextToSpeech.fromPartial(object.text_to_speech)
      : undefined;
    message.get_workcells = (object.get_workcells !== undefined && object.get_workcells !== null)
      ? Command_GetWorkcells.fromPartial(object.get_workcells)
      : undefined;
    message.log_media_exchange = (object.log_media_exchange !== undefined && object.log_media_exchange !== null)
      ? Command_LogMediaExchange.fromPartial(object.log_media_exchange)
      : undefined;
    message.get_liconic_sensor_data =
      (object.get_liconic_sensor_data !== undefined && object.get_liconic_sensor_data !== null)
        ? Command_GetLiconicSensorData.fromPartial(object.get_liconic_sensor_data)
        : undefined;
    message.get_ot2_images_by_date =
      (object.get_ot2_images_by_date !== undefined && object.get_ot2_images_by_date !== null)
        ? Command_GetOT2ImagesByDate.fromPartial(object.get_ot2_images_by_date)
        : undefined;
    message.get_ot2_image_bytes = (object.get_ot2_image_bytes !== undefined && object.get_ot2_image_bytes !== null)
      ? Command_GetOT2ImageBytes.fromPartial(object.get_ot2_image_bytes)
      : undefined;
    message.get_ot2_image_prediction =
      (object.get_ot2_image_prediction !== undefined && object.get_ot2_image_prediction !== null)
        ? Command_GetOT2ImagePrediction.fromPartial(object.get_ot2_image_prediction)
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
    message.get_log_media_exchange_by_date =
      (object.get_log_media_exchange_by_date !== undefined && object.get_log_media_exchange_by_date !== null)
        ? Command_GetLogMediaExchangeByDate.fromPartial(object.get_log_media_exchange_by_date)
        : undefined;
    message.validate_folder = (object.validate_folder !== undefined && object.validate_folder !== null)
      ? Command_ValidateFolder.fromPartial(object.validate_folder)
      : undefined;
    message.write_to_json = (object.write_to_json !== undefined && object.write_to_json !== null)
      ? Command_WriteToJson.fromPartial(object.write_to_json)
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

function createBaseCommand_Timer(): Command_Timer {
  return { time_seconds: 0, message: undefined };
}

export const Command_Timer = {
  encode(message: Command_Timer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.time_seconds !== 0) {
      writer.uint32(8).int32(message.time_seconds);
    }
    if (message.message !== undefined) {
      writer.uint32(18).string(message.message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Timer {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Timer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.time_seconds = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
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

  fromJSON(object: any): Command_Timer {
    return {
      time_seconds: isSet(object.time_seconds) ? Number(object.time_seconds) : 0,
      message: isSet(object.message) ? String(object.message) : undefined,
    };
  },

  toJSON(message: Command_Timer): unknown {
    const obj: any = {};
    message.time_seconds !== undefined && (obj.time_seconds = Math.round(message.time_seconds));
    message.message !== undefined && (obj.message = message.message);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Timer>, I>>(base?: I): Command_Timer {
    return Command_Timer.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Timer>, I>>(object: I): Command_Timer {
    const message = createBaseCommand_Timer();
    message.time_seconds = object.time_seconds ?? 0;
    message.message = object.message ?? undefined;
    return message;
  },
};

function createBaseCommand_UserMessage(): Command_UserMessage {
  return { message: "", title: "", message_type: "" };
}

export const Command_UserMessage = {
  encode(message: Command_UserMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    if (message.title !== "") {
      writer.uint32(18).string(message.title);
    }
    if (message.message_type !== "") {
      writer.uint32(26).string(message.message_type);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_UserMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_UserMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.message = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.title = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.message_type = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_UserMessage {
    return {
      message: isSet(object.message) ? String(object.message) : "",
      title: isSet(object.title) ? String(object.title) : "",
      message_type: isSet(object.message_type) ? String(object.message_type) : "",
    };
  },

  toJSON(message: Command_UserMessage): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    message.title !== undefined && (obj.title = message.title);
    message.message_type !== undefined && (obj.message_type = message.message_type);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_UserMessage>, I>>(base?: I): Command_UserMessage {
    return Command_UserMessage.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_UserMessage>, I>>(object: I): Command_UserMessage {
    const message = createBaseCommand_UserMessage();
    message.message = object.message ?? "";
    message.title = object.title ?? "";
    message.message_type = object.message_type ?? "";
    return message;
  },
};

function createBaseCommand_ShowImage(): Command_ShowImage {
  return { file: "", title: undefined, width: undefined, height: undefined };
}

export const Command_ShowImage = {
  encode(message: Command_ShowImage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.file !== "") {
      writer.uint32(10).string(message.file);
    }
    if (message.title !== undefined) {
      writer.uint32(18).string(message.title);
    }
    if (message.width !== undefined) {
      writer.uint32(24).int32(message.width);
    }
    if (message.height !== undefined) {
      writer.uint32(32).int32(message.height);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_ShowImage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_ShowImage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.file = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.title = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.width = reader.int32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.height = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_ShowImage {
    return {
      file: isSet(object.file) ? String(object.file) : "",
      title: isSet(object.title) ? String(object.title) : undefined,
      width: isSet(object.width) ? Number(object.width) : undefined,
      height: isSet(object.height) ? Number(object.height) : undefined,
    };
  },

  toJSON(message: Command_ShowImage): unknown {
    const obj: any = {};
    message.file !== undefined && (obj.file = message.file);
    message.title !== undefined && (obj.title = message.title);
    message.width !== undefined && (obj.width = Math.round(message.width));
    message.height !== undefined && (obj.height = Math.round(message.height));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_ShowImage>, I>>(base?: I): Command_ShowImage {
    return Command_ShowImage.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ShowImage>, I>>(object: I): Command_ShowImage {
    const message = createBaseCommand_ShowImage();
    message.file = object.file ?? "";
    message.title = object.title ?? undefined;
    message.width = object.width ?? undefined;
    message.height = object.height ?? undefined;
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

function createBaseCommand_SendEmail(): Command_SendEmail {
  return { recipients: undefined, message: "", subject: "" };
}

export const Command_SendEmail = {
  encode(message: Command_SendEmail, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.recipients !== undefined) {
      writer.uint32(10).string(message.recipients);
    }
    if (message.message !== "") {
      writer.uint32(18).string(message.message);
    }
    if (message.subject !== "") {
      writer.uint32(26).string(message.subject);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SendEmail {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SendEmail();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.recipients = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.message = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.subject = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_SendEmail {
    return {
      recipients: isSet(object.recipients) ? String(object.recipients) : undefined,
      message: isSet(object.message) ? String(object.message) : "",
      subject: isSet(object.subject) ? String(object.subject) : "",
    };
  },

  toJSON(message: Command_SendEmail): unknown {
    const obj: any = {};
    message.recipients !== undefined && (obj.recipients = message.recipients);
    message.message !== undefined && (obj.message = message.message);
    message.subject !== undefined && (obj.subject = message.subject);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SendEmail>, I>>(base?: I): Command_SendEmail {
    return Command_SendEmail.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SendEmail>, I>>(object: I): Command_SendEmail {
    const message = createBaseCommand_SendEmail();
    message.recipients = object.recipients ?? undefined;
    message.message = object.message ?? "";
    message.subject = object.subject ?? "";
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

function createBaseCommand_GetWorkcells(): Command_GetWorkcells {
  return {};
}

export const Command_GetWorkcells = {
  encode(_: Command_GetWorkcells, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetWorkcells {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetWorkcells();
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

  fromJSON(_: any): Command_GetWorkcells {
    return {};
  },

  toJSON(_: Command_GetWorkcells): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetWorkcells>, I>>(base?: I): Command_GetWorkcells {
    return Command_GetWorkcells.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetWorkcells>, I>>(_: I): Command_GetWorkcells {
    const message = createBaseCommand_GetWorkcells();
    return message;
  },
};

function createBaseCommand_LogMediaExchange(): Command_LogMediaExchange {
  return {
    source_barcode: "",
    destination_name: "",
    destination_barcode: "",
    source_wells: [],
    percent_exchange: 0,
    new_tips: false,
  };
}

export const Command_LogMediaExchange = {
  encode(message: Command_LogMediaExchange, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.source_barcode !== "") {
      writer.uint32(10).string(message.source_barcode);
    }
    if (message.destination_name !== "") {
      writer.uint32(18).string(message.destination_name);
    }
    if (message.destination_barcode !== "") {
      writer.uint32(26).string(message.destination_barcode);
    }
    for (const v of message.source_wells) {
      writer.uint32(34).string(v!);
    }
    if (message.percent_exchange !== 0) {
      writer.uint32(40).int32(message.percent_exchange);
    }
    if (message.new_tips === true) {
      writer.uint32(48).bool(message.new_tips);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_LogMediaExchange {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_LogMediaExchange();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.source_barcode = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.destination_name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.destination_barcode = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.source_wells.push(reader.string());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.percent_exchange = reader.int32();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.new_tips = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_LogMediaExchange {
    return {
      source_barcode: isSet(object.source_barcode) ? String(object.source_barcode) : "",
      destination_name: isSet(object.destination_name) ? String(object.destination_name) : "",
      destination_barcode: isSet(object.destination_barcode) ? String(object.destination_barcode) : "",
      source_wells: Array.isArray(object?.source_wells) ? object.source_wells.map((e: any) => String(e)) : [],
      percent_exchange: isSet(object.percent_exchange) ? Number(object.percent_exchange) : 0,
      new_tips: isSet(object.new_tips) ? Boolean(object.new_tips) : false,
    };
  },

  toJSON(message: Command_LogMediaExchange): unknown {
    const obj: any = {};
    message.source_barcode !== undefined && (obj.source_barcode = message.source_barcode);
    message.destination_name !== undefined && (obj.destination_name = message.destination_name);
    message.destination_barcode !== undefined && (obj.destination_barcode = message.destination_barcode);
    if (message.source_wells) {
      obj.source_wells = message.source_wells.map((e) => e);
    } else {
      obj.source_wells = [];
    }
    message.percent_exchange !== undefined && (obj.percent_exchange = Math.round(message.percent_exchange));
    message.new_tips !== undefined && (obj.new_tips = message.new_tips);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_LogMediaExchange>, I>>(base?: I): Command_LogMediaExchange {
    return Command_LogMediaExchange.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_LogMediaExchange>, I>>(object: I): Command_LogMediaExchange {
    const message = createBaseCommand_LogMediaExchange();
    message.source_barcode = object.source_barcode ?? "";
    message.destination_name = object.destination_name ?? "";
    message.destination_barcode = object.destination_barcode ?? "";
    message.source_wells = object.source_wells?.map((e) => e) || [];
    message.percent_exchange = object.percent_exchange ?? 0;
    message.new_tips = object.new_tips ?? false;
    return message;
  },
};

function createBaseCommand_GetLogMediaExchangeByDate(): Command_GetLogMediaExchangeByDate {
  return { date: "" };
}

export const Command_GetLogMediaExchangeByDate = {
  encode(message: Command_GetLogMediaExchangeByDate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.date !== "") {
      writer.uint32(10).string(message.date);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetLogMediaExchangeByDate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetLogMediaExchangeByDate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.date = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_GetLogMediaExchangeByDate {
    return { date: isSet(object.date) ? String(object.date) : "" };
  },

  toJSON(message: Command_GetLogMediaExchangeByDate): unknown {
    const obj: any = {};
    message.date !== undefined && (obj.date = message.date);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetLogMediaExchangeByDate>, I>>(
    base?: I,
  ): Command_GetLogMediaExchangeByDate {
    return Command_GetLogMediaExchangeByDate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetLogMediaExchangeByDate>, I>>(
    object: I,
  ): Command_GetLogMediaExchangeByDate {
    const message = createBaseCommand_GetLogMediaExchangeByDate();
    message.date = object.date ?? "";
    return message;
  },
};

function createBaseCommand_GetLiconicSensorData(): Command_GetLiconicSensorData {
  return { tool_id: "", date: "" };
}

export const Command_GetLiconicSensorData = {
  encode(message: Command_GetLiconicSensorData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tool_id !== "") {
      writer.uint32(10).string(message.tool_id);
    }
    if (message.date !== "") {
      writer.uint32(18).string(message.date);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetLiconicSensorData {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetLiconicSensorData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.tool_id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.date = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_GetLiconicSensorData {
    return {
      tool_id: isSet(object.tool_id) ? String(object.tool_id) : "",
      date: isSet(object.date) ? String(object.date) : "",
    };
  },

  toJSON(message: Command_GetLiconicSensorData): unknown {
    const obj: any = {};
    message.tool_id !== undefined && (obj.tool_id = message.tool_id);
    message.date !== undefined && (obj.date = message.date);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetLiconicSensorData>, I>>(base?: I): Command_GetLiconicSensorData {
    return Command_GetLiconicSensorData.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetLiconicSensorData>, I>>(object: I): Command_GetLiconicSensorData {
    const message = createBaseCommand_GetLiconicSensorData();
    message.tool_id = object.tool_id ?? "";
    message.date = object.date ?? "";
    return message;
  },
};

function createBaseCommand_GetOT2ImagesByDate(): Command_GetOT2ImagesByDate {
  return { date: "" };
}

export const Command_GetOT2ImagesByDate = {
  encode(message: Command_GetOT2ImagesByDate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.date !== "") {
      writer.uint32(10).string(message.date);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetOT2ImagesByDate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetOT2ImagesByDate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.date = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_GetOT2ImagesByDate {
    return { date: isSet(object.date) ? String(object.date) : "" };
  },

  toJSON(message: Command_GetOT2ImagesByDate): unknown {
    const obj: any = {};
    message.date !== undefined && (obj.date = message.date);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetOT2ImagesByDate>, I>>(base?: I): Command_GetOT2ImagesByDate {
    return Command_GetOT2ImagesByDate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetOT2ImagesByDate>, I>>(object: I): Command_GetOT2ImagesByDate {
    const message = createBaseCommand_GetOT2ImagesByDate();
    message.date = object.date ?? "";
    return message;
  },
};

function createBaseCommand_GetOT2ImageBytes(): Command_GetOT2ImageBytes {
  return { date: "", image_file: "" };
}

export const Command_GetOT2ImageBytes = {
  encode(message: Command_GetOT2ImageBytes, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.date !== "") {
      writer.uint32(10).string(message.date);
    }
    if (message.image_file !== "") {
      writer.uint32(18).string(message.image_file);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetOT2ImageBytes {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetOT2ImageBytes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.date = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.image_file = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_GetOT2ImageBytes {
    return {
      date: isSet(object.date) ? String(object.date) : "",
      image_file: isSet(object.image_file) ? String(object.image_file) : "",
    };
  },

  toJSON(message: Command_GetOT2ImageBytes): unknown {
    const obj: any = {};
    message.date !== undefined && (obj.date = message.date);
    message.image_file !== undefined && (obj.image_file = message.image_file);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetOT2ImageBytes>, I>>(base?: I): Command_GetOT2ImageBytes {
    return Command_GetOT2ImageBytes.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetOT2ImageBytes>, I>>(object: I): Command_GetOT2ImageBytes {
    const message = createBaseCommand_GetOT2ImageBytes();
    message.date = object.date ?? "";
    message.image_file = object.image_file ?? "";
    return message;
  },
};

function createBaseCommand_ImageResponse(): Command_ImageResponse {
  return { image_data: new Uint8Array(0) };
}

export const Command_ImageResponse = {
  encode(message: Command_ImageResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.image_data.length !== 0) {
      writer.uint32(10).bytes(message.image_data);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_ImageResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_ImageResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.image_data = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_ImageResponse {
    return { image_data: isSet(object.image_data) ? bytesFromBase64(object.image_data) : new Uint8Array(0) };
  },

  toJSON(message: Command_ImageResponse): unknown {
    const obj: any = {};
    message.image_data !== undefined &&
      (obj.image_data = base64FromBytes(message.image_data !== undefined ? message.image_data : new Uint8Array(0)));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_ImageResponse>, I>>(base?: I): Command_ImageResponse {
    return Command_ImageResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ImageResponse>, I>>(object: I): Command_ImageResponse {
    const message = createBaseCommand_ImageResponse();
    message.image_data = object.image_data ?? new Uint8Array(0);
    return message;
  },
};

function createBaseCommand_GetOT2ImagePrediction(): Command_GetOT2ImagePrediction {
  return { date: "", image_file: "" };
}

export const Command_GetOT2ImagePrediction = {
  encode(message: Command_GetOT2ImagePrediction, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.date !== "") {
      writer.uint32(10).string(message.date);
    }
    if (message.image_file !== "") {
      writer.uint32(18).string(message.image_file);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetOT2ImagePrediction {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetOT2ImagePrediction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.date = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.image_file = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_GetOT2ImagePrediction {
    return {
      date: isSet(object.date) ? String(object.date) : "",
      image_file: isSet(object.image_file) ? String(object.image_file) : "",
    };
  },

  toJSON(message: Command_GetOT2ImagePrediction): unknown {
    const obj: any = {};
    message.date !== undefined && (obj.date = message.date);
    message.image_file !== undefined && (obj.image_file = message.image_file);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetOT2ImagePrediction>, I>>(base?: I): Command_GetOT2ImagePrediction {
    return Command_GetOT2ImagePrediction.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetOT2ImagePrediction>, I>>(
    object: I,
  ): Command_GetOT2ImagePrediction {
    const message = createBaseCommand_GetOT2ImagePrediction();
    message.date = object.date ?? "";
    message.image_file = object.image_file ?? "";
    return message;
  },
};

function createBaseCommand_RunScript(): Command_RunScript {
  return { name: "", blocking: false };
}

export const Command_RunScript = {
  encode(message: Command_RunScript, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
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

          message.name = reader.string();
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
      name: isSet(object.name) ? String(object.name) : "",
      blocking: isSet(object.blocking) ? Boolean(object.blocking) : false,
    };
  },

  toJSON(message: Command_RunScript): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.blocking !== undefined && (obj.blocking = message.blocking);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_RunScript>, I>>(base?: I): Command_RunScript {
    return Command_RunScript.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_RunScript>, I>>(object: I): Command_RunScript {
    const message = createBaseCommand_RunScript();
    message.name = object.name ?? "";
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

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

function bytesFromBase64(b64: string): Uint8Array {
  if (tsProtoGlobalThis.Buffer) {
    return Uint8Array.from(tsProtoGlobalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = tsProtoGlobalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (tsProtoGlobalThis.Buffer) {
    return tsProtoGlobalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(String.fromCharCode(byte));
    });
    return tsProtoGlobalThis.btoa(bin.join(""));
  }
}

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
