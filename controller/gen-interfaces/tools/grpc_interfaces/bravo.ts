/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Struct } from "../../google/protobuf/struct";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.bravo";

export interface Command {
  home?: Command_Home | undefined;
  mix?: Command_Mix | undefined;
  aspirate?: Command_Aspirate | undefined;
  dispense?: Command_Dispense | undefined;
  tips_on?: Command_TipsOn | undefined;
  tips_off?: Command_TipsOff | undefined;
  move_to_location?: Command_MoveToLocation | undefined;
  configure_deck?: Command_ConfigureDeck | undefined;
  show_diagnostics?: Command_ShowDiagnostics | undefined;
}

export interface Command_Home {
  axis: string;
  force_initialize: boolean;
}

export interface Command_Mix {
  location: number;
  volume: number;
  pre_aspirate_volume: number;
  blow_out_volume: number;
  liquid_class: string;
  cycles: number;
  retract_distance_per_microliter: number;
  pipette_technique: string;
  aspirate_distance: number;
  dispense_distance: number;
  perform_tip_touch: boolean;
  tip_touch_side: string;
  tip_touch_retract_distance: number;
  tip_touch_horizonal_offset: number;
}

export interface Command_Aspirate {
  location: number;
  volume: number;
  pre_aspirate_volume: number;
  post_aspirate_volume: number;
  liquid_class: string;
  distance_from_well_bottom: number;
  retract_distance_per_microliter: number;
  pipette_technique: string;
  perform_tip_touch: boolean;
  tip_touch_side: string;
  tip_touch_retract_distance: number;
  tip_touch_horizonal_offset: number;
}

export interface Command_Dispense {
  location: number;
  empty_tips: boolean;
  volume: number;
  blow_out_volume: number;
  liquid_class: string;
  distance_from_well_bottom: number;
  retract_distance_per_microliter: number;
  pipette_technique: string;
  perform_tip_touch: boolean;
  tip_touch_side: string;
  tip_touch_retract_distance: number;
  tip_touch_horizonal_offset: number;
}

export interface Command_TipsOn {
  plate_location: number;
}

export interface Command_TipsOff {
  plate_location: number;
}

export interface Command_MoveToLocation {
  plate_location: number;
}

export interface Command_ShowDiagnostics {
}

export interface Command_ConfigureDeck {
  deck_configuration: { [key: string]: any } | undefined;
}

export interface Response {
  success?: Response_Success | undefined;
  error?: Response_Error | undefined;
  device_configuration?: Response_DeviceConfiguration | undefined;
  firmware_version?: Response_FirmwareVersion | undefined;
  profiles_list?: Response_ProfilesList | undefined;
}

export interface Response_Success {
  message: string;
}

export interface Response_Error {
  error_message: string;
  error_code: number;
}

export interface Response_DeviceConfiguration {
  configuration: string;
}

export interface Response_FirmwareVersion {
  version: string;
}

export interface Response_ProfilesList {
  profiles: string[];
}

export interface Config {
  device_file: string;
}

function createBaseCommand(): Command {
  return {
    home: undefined,
    mix: undefined,
    aspirate: undefined,
    dispense: undefined,
    tips_on: undefined,
    tips_off: undefined,
    move_to_location: undefined,
    configure_deck: undefined,
    show_diagnostics: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.home !== undefined) {
      Command_Home.encode(message.home, writer.uint32(10).fork()).ldelim();
    }
    if (message.mix !== undefined) {
      Command_Mix.encode(message.mix, writer.uint32(18).fork()).ldelim();
    }
    if (message.aspirate !== undefined) {
      Command_Aspirate.encode(message.aspirate, writer.uint32(26).fork()).ldelim();
    }
    if (message.dispense !== undefined) {
      Command_Dispense.encode(message.dispense, writer.uint32(34).fork()).ldelim();
    }
    if (message.tips_on !== undefined) {
      Command_TipsOn.encode(message.tips_on, writer.uint32(42).fork()).ldelim();
    }
    if (message.tips_off !== undefined) {
      Command_TipsOff.encode(message.tips_off, writer.uint32(50).fork()).ldelim();
    }
    if (message.move_to_location !== undefined) {
      Command_MoveToLocation.encode(message.move_to_location, writer.uint32(58).fork()).ldelim();
    }
    if (message.configure_deck !== undefined) {
      Command_ConfigureDeck.encode(message.configure_deck, writer.uint32(66).fork()).ldelim();
    }
    if (message.show_diagnostics !== undefined) {
      Command_ShowDiagnostics.encode(message.show_diagnostics, writer.uint32(74).fork()).ldelim();
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

          message.mix = Command_Mix.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.aspirate = Command_Aspirate.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.dispense = Command_Dispense.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.tips_on = Command_TipsOn.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.tips_off = Command_TipsOff.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.move_to_location = Command_MoveToLocation.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.configure_deck = Command_ConfigureDeck.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.show_diagnostics = Command_ShowDiagnostics.decode(reader, reader.uint32());
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
      mix: isSet(object.mix) ? Command_Mix.fromJSON(object.mix) : undefined,
      aspirate: isSet(object.aspirate) ? Command_Aspirate.fromJSON(object.aspirate) : undefined,
      dispense: isSet(object.dispense) ? Command_Dispense.fromJSON(object.dispense) : undefined,
      tips_on: isSet(object.tips_on) ? Command_TipsOn.fromJSON(object.tips_on) : undefined,
      tips_off: isSet(object.tips_off) ? Command_TipsOff.fromJSON(object.tips_off) : undefined,
      move_to_location: isSet(object.move_to_location)
        ? Command_MoveToLocation.fromJSON(object.move_to_location)
        : undefined,
      configure_deck: isSet(object.configure_deck) ? Command_ConfigureDeck.fromJSON(object.configure_deck) : undefined,
      show_diagnostics: isSet(object.show_diagnostics)
        ? Command_ShowDiagnostics.fromJSON(object.show_diagnostics)
        : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.home !== undefined && (obj.home = message.home ? Command_Home.toJSON(message.home) : undefined);
    message.mix !== undefined && (obj.mix = message.mix ? Command_Mix.toJSON(message.mix) : undefined);
    message.aspirate !== undefined &&
      (obj.aspirate = message.aspirate ? Command_Aspirate.toJSON(message.aspirate) : undefined);
    message.dispense !== undefined &&
      (obj.dispense = message.dispense ? Command_Dispense.toJSON(message.dispense) : undefined);
    message.tips_on !== undefined &&
      (obj.tips_on = message.tips_on ? Command_TipsOn.toJSON(message.tips_on) : undefined);
    message.tips_off !== undefined &&
      (obj.tips_off = message.tips_off ? Command_TipsOff.toJSON(message.tips_off) : undefined);
    message.move_to_location !== undefined && (obj.move_to_location = message.move_to_location
      ? Command_MoveToLocation.toJSON(message.move_to_location)
      : undefined);
    message.configure_deck !== undefined &&
      (obj.configure_deck = message.configure_deck ? Command_ConfigureDeck.toJSON(message.configure_deck) : undefined);
    message.show_diagnostics !== undefined && (obj.show_diagnostics = message.show_diagnostics
      ? Command_ShowDiagnostics.toJSON(message.show_diagnostics)
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
    message.mix = (object.mix !== undefined && object.mix !== null) ? Command_Mix.fromPartial(object.mix) : undefined;
    message.aspirate = (object.aspirate !== undefined && object.aspirate !== null)
      ? Command_Aspirate.fromPartial(object.aspirate)
      : undefined;
    message.dispense = (object.dispense !== undefined && object.dispense !== null)
      ? Command_Dispense.fromPartial(object.dispense)
      : undefined;
    message.tips_on = (object.tips_on !== undefined && object.tips_on !== null)
      ? Command_TipsOn.fromPartial(object.tips_on)
      : undefined;
    message.tips_off = (object.tips_off !== undefined && object.tips_off !== null)
      ? Command_TipsOff.fromPartial(object.tips_off)
      : undefined;
    message.move_to_location = (object.move_to_location !== undefined && object.move_to_location !== null)
      ? Command_MoveToLocation.fromPartial(object.move_to_location)
      : undefined;
    message.configure_deck = (object.configure_deck !== undefined && object.configure_deck !== null)
      ? Command_ConfigureDeck.fromPartial(object.configure_deck)
      : undefined;
    message.show_diagnostics = (object.show_diagnostics !== undefined && object.show_diagnostics !== null)
      ? Command_ShowDiagnostics.fromPartial(object.show_diagnostics)
      : undefined;
    return message;
  },
};

function createBaseCommand_Home(): Command_Home {
  return { axis: "", force_initialize: false };
}

export const Command_Home = {
  encode(message: Command_Home, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.axis !== "") {
      writer.uint32(10).string(message.axis);
    }
    if (message.force_initialize === true) {
      writer.uint32(16).bool(message.force_initialize);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Home {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Home();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.axis = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.force_initialize = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Home {
    return {
      axis: isSet(object.axis) ? String(object.axis) : "",
      force_initialize: isSet(object.force_initialize) ? Boolean(object.force_initialize) : false,
    };
  },

  toJSON(message: Command_Home): unknown {
    const obj: any = {};
    message.axis !== undefined && (obj.axis = message.axis);
    message.force_initialize !== undefined && (obj.force_initialize = message.force_initialize);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Home>, I>>(base?: I): Command_Home {
    return Command_Home.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Home>, I>>(object: I): Command_Home {
    const message = createBaseCommand_Home();
    message.axis = object.axis ?? "";
    message.force_initialize = object.force_initialize ?? false;
    return message;
  },
};

function createBaseCommand_Mix(): Command_Mix {
  return {
    location: 0,
    volume: 0,
    pre_aspirate_volume: 0,
    blow_out_volume: 0,
    liquid_class: "",
    cycles: 0,
    retract_distance_per_microliter: 0,
    pipette_technique: "",
    aspirate_distance: 0,
    dispense_distance: 0,
    perform_tip_touch: false,
    tip_touch_side: "",
    tip_touch_retract_distance: 0,
    tip_touch_horizonal_offset: 0,
  };
}

export const Command_Mix = {
  encode(message: Command_Mix, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.location !== 0) {
      writer.uint32(8).int32(message.location);
    }
    if (message.volume !== 0) {
      writer.uint32(21).float(message.volume);
    }
    if (message.pre_aspirate_volume !== 0) {
      writer.uint32(29).float(message.pre_aspirate_volume);
    }
    if (message.blow_out_volume !== 0) {
      writer.uint32(37).float(message.blow_out_volume);
    }
    if (message.liquid_class !== "") {
      writer.uint32(42).string(message.liquid_class);
    }
    if (message.cycles !== 0) {
      writer.uint32(48).int32(message.cycles);
    }
    if (message.retract_distance_per_microliter !== 0) {
      writer.uint32(61).float(message.retract_distance_per_microliter);
    }
    if (message.pipette_technique !== "") {
      writer.uint32(66).string(message.pipette_technique);
    }
    if (message.aspirate_distance !== 0) {
      writer.uint32(77).float(message.aspirate_distance);
    }
    if (message.dispense_distance !== 0) {
      writer.uint32(85).float(message.dispense_distance);
    }
    if (message.perform_tip_touch === true) {
      writer.uint32(88).bool(message.perform_tip_touch);
    }
    if (message.tip_touch_side !== "") {
      writer.uint32(98).string(message.tip_touch_side);
    }
    if (message.tip_touch_retract_distance !== 0) {
      writer.uint32(109).float(message.tip_touch_retract_distance);
    }
    if (message.tip_touch_horizonal_offset !== 0) {
      writer.uint32(117).float(message.tip_touch_horizonal_offset);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Mix {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Mix();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.location = reader.int32();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.volume = reader.float();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.pre_aspirate_volume = reader.float();
          continue;
        case 4:
          if (tag !== 37) {
            break;
          }

          message.blow_out_volume = reader.float();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.liquid_class = reader.string();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.cycles = reader.int32();
          continue;
        case 7:
          if (tag !== 61) {
            break;
          }

          message.retract_distance_per_microliter = reader.float();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.pipette_technique = reader.string();
          continue;
        case 9:
          if (tag !== 77) {
            break;
          }

          message.aspirate_distance = reader.float();
          continue;
        case 10:
          if (tag !== 85) {
            break;
          }

          message.dispense_distance = reader.float();
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }

          message.perform_tip_touch = reader.bool();
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.tip_touch_side = reader.string();
          continue;
        case 13:
          if (tag !== 109) {
            break;
          }

          message.tip_touch_retract_distance = reader.float();
          continue;
        case 14:
          if (tag !== 117) {
            break;
          }

          message.tip_touch_horizonal_offset = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Mix {
    return {
      location: isSet(object.location) ? Number(object.location) : 0,
      volume: isSet(object.volume) ? Number(object.volume) : 0,
      pre_aspirate_volume: isSet(object.pre_aspirate_volume) ? Number(object.pre_aspirate_volume) : 0,
      blow_out_volume: isSet(object.blow_out_volume) ? Number(object.blow_out_volume) : 0,
      liquid_class: isSet(object.liquid_class) ? String(object.liquid_class) : "",
      cycles: isSet(object.cycles) ? Number(object.cycles) : 0,
      retract_distance_per_microliter: isSet(object.retract_distance_per_microliter)
        ? Number(object.retract_distance_per_microliter)
        : 0,
      pipette_technique: isSet(object.pipette_technique) ? String(object.pipette_technique) : "",
      aspirate_distance: isSet(object.aspirate_distance) ? Number(object.aspirate_distance) : 0,
      dispense_distance: isSet(object.dispense_distance) ? Number(object.dispense_distance) : 0,
      perform_tip_touch: isSet(object.perform_tip_touch) ? Boolean(object.perform_tip_touch) : false,
      tip_touch_side: isSet(object.tip_touch_side) ? String(object.tip_touch_side) : "",
      tip_touch_retract_distance: isSet(object.tip_touch_retract_distance)
        ? Number(object.tip_touch_retract_distance)
        : 0,
      tip_touch_horizonal_offset: isSet(object.tip_touch_horizonal_offset)
        ? Number(object.tip_touch_horizonal_offset)
        : 0,
    };
  },

  toJSON(message: Command_Mix): unknown {
    const obj: any = {};
    message.location !== undefined && (obj.location = Math.round(message.location));
    message.volume !== undefined && (obj.volume = message.volume);
    message.pre_aspirate_volume !== undefined && (obj.pre_aspirate_volume = message.pre_aspirate_volume);
    message.blow_out_volume !== undefined && (obj.blow_out_volume = message.blow_out_volume);
    message.liquid_class !== undefined && (obj.liquid_class = message.liquid_class);
    message.cycles !== undefined && (obj.cycles = Math.round(message.cycles));
    message.retract_distance_per_microliter !== undefined &&
      (obj.retract_distance_per_microliter = message.retract_distance_per_microliter);
    message.pipette_technique !== undefined && (obj.pipette_technique = message.pipette_technique);
    message.aspirate_distance !== undefined && (obj.aspirate_distance = message.aspirate_distance);
    message.dispense_distance !== undefined && (obj.dispense_distance = message.dispense_distance);
    message.perform_tip_touch !== undefined && (obj.perform_tip_touch = message.perform_tip_touch);
    message.tip_touch_side !== undefined && (obj.tip_touch_side = message.tip_touch_side);
    message.tip_touch_retract_distance !== undefined &&
      (obj.tip_touch_retract_distance = message.tip_touch_retract_distance);
    message.tip_touch_horizonal_offset !== undefined &&
      (obj.tip_touch_horizonal_offset = message.tip_touch_horizonal_offset);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Mix>, I>>(base?: I): Command_Mix {
    return Command_Mix.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Mix>, I>>(object: I): Command_Mix {
    const message = createBaseCommand_Mix();
    message.location = object.location ?? 0;
    message.volume = object.volume ?? 0;
    message.pre_aspirate_volume = object.pre_aspirate_volume ?? 0;
    message.blow_out_volume = object.blow_out_volume ?? 0;
    message.liquid_class = object.liquid_class ?? "";
    message.cycles = object.cycles ?? 0;
    message.retract_distance_per_microliter = object.retract_distance_per_microliter ?? 0;
    message.pipette_technique = object.pipette_technique ?? "";
    message.aspirate_distance = object.aspirate_distance ?? 0;
    message.dispense_distance = object.dispense_distance ?? 0;
    message.perform_tip_touch = object.perform_tip_touch ?? false;
    message.tip_touch_side = object.tip_touch_side ?? "";
    message.tip_touch_retract_distance = object.tip_touch_retract_distance ?? 0;
    message.tip_touch_horizonal_offset = object.tip_touch_horizonal_offset ?? 0;
    return message;
  },
};

function createBaseCommand_Aspirate(): Command_Aspirate {
  return {
    location: 0,
    volume: 0,
    pre_aspirate_volume: 0,
    post_aspirate_volume: 0,
    liquid_class: "",
    distance_from_well_bottom: 0,
    retract_distance_per_microliter: 0,
    pipette_technique: "",
    perform_tip_touch: false,
    tip_touch_side: "",
    tip_touch_retract_distance: 0,
    tip_touch_horizonal_offset: 0,
  };
}

export const Command_Aspirate = {
  encode(message: Command_Aspirate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.location !== 0) {
      writer.uint32(8).int32(message.location);
    }
    if (message.volume !== 0) {
      writer.uint32(21).float(message.volume);
    }
    if (message.pre_aspirate_volume !== 0) {
      writer.uint32(29).float(message.pre_aspirate_volume);
    }
    if (message.post_aspirate_volume !== 0) {
      writer.uint32(37).float(message.post_aspirate_volume);
    }
    if (message.liquid_class !== "") {
      writer.uint32(42).string(message.liquid_class);
    }
    if (message.distance_from_well_bottom !== 0) {
      writer.uint32(53).float(message.distance_from_well_bottom);
    }
    if (message.retract_distance_per_microliter !== 0) {
      writer.uint32(61).float(message.retract_distance_per_microliter);
    }
    if (message.pipette_technique !== "") {
      writer.uint32(66).string(message.pipette_technique);
    }
    if (message.perform_tip_touch === true) {
      writer.uint32(72).bool(message.perform_tip_touch);
    }
    if (message.tip_touch_side !== "") {
      writer.uint32(82).string(message.tip_touch_side);
    }
    if (message.tip_touch_retract_distance !== 0) {
      writer.uint32(93).float(message.tip_touch_retract_distance);
    }
    if (message.tip_touch_horizonal_offset !== 0) {
      writer.uint32(101).float(message.tip_touch_horizonal_offset);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Aspirate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Aspirate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.location = reader.int32();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.volume = reader.float();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.pre_aspirate_volume = reader.float();
          continue;
        case 4:
          if (tag !== 37) {
            break;
          }

          message.post_aspirate_volume = reader.float();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.liquid_class = reader.string();
          continue;
        case 6:
          if (tag !== 53) {
            break;
          }

          message.distance_from_well_bottom = reader.float();
          continue;
        case 7:
          if (tag !== 61) {
            break;
          }

          message.retract_distance_per_microliter = reader.float();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.pipette_technique = reader.string();
          continue;
        case 9:
          if (tag !== 72) {
            break;
          }

          message.perform_tip_touch = reader.bool();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.tip_touch_side = reader.string();
          continue;
        case 11:
          if (tag !== 93) {
            break;
          }

          message.tip_touch_retract_distance = reader.float();
          continue;
        case 12:
          if (tag !== 101) {
            break;
          }

          message.tip_touch_horizonal_offset = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Aspirate {
    return {
      location: isSet(object.location) ? Number(object.location) : 0,
      volume: isSet(object.volume) ? Number(object.volume) : 0,
      pre_aspirate_volume: isSet(object.pre_aspirate_volume) ? Number(object.pre_aspirate_volume) : 0,
      post_aspirate_volume: isSet(object.post_aspirate_volume) ? Number(object.post_aspirate_volume) : 0,
      liquid_class: isSet(object.liquid_class) ? String(object.liquid_class) : "",
      distance_from_well_bottom: isSet(object.distance_from_well_bottom) ? Number(object.distance_from_well_bottom) : 0,
      retract_distance_per_microliter: isSet(object.retract_distance_per_microliter)
        ? Number(object.retract_distance_per_microliter)
        : 0,
      pipette_technique: isSet(object.pipette_technique) ? String(object.pipette_technique) : "",
      perform_tip_touch: isSet(object.perform_tip_touch) ? Boolean(object.perform_tip_touch) : false,
      tip_touch_side: isSet(object.tip_touch_side) ? String(object.tip_touch_side) : "",
      tip_touch_retract_distance: isSet(object.tip_touch_retract_distance)
        ? Number(object.tip_touch_retract_distance)
        : 0,
      tip_touch_horizonal_offset: isSet(object.tip_touch_horizonal_offset)
        ? Number(object.tip_touch_horizonal_offset)
        : 0,
    };
  },

  toJSON(message: Command_Aspirate): unknown {
    const obj: any = {};
    message.location !== undefined && (obj.location = Math.round(message.location));
    message.volume !== undefined && (obj.volume = message.volume);
    message.pre_aspirate_volume !== undefined && (obj.pre_aspirate_volume = message.pre_aspirate_volume);
    message.post_aspirate_volume !== undefined && (obj.post_aspirate_volume = message.post_aspirate_volume);
    message.liquid_class !== undefined && (obj.liquid_class = message.liquid_class);
    message.distance_from_well_bottom !== undefined &&
      (obj.distance_from_well_bottom = message.distance_from_well_bottom);
    message.retract_distance_per_microliter !== undefined &&
      (obj.retract_distance_per_microliter = message.retract_distance_per_microliter);
    message.pipette_technique !== undefined && (obj.pipette_technique = message.pipette_technique);
    message.perform_tip_touch !== undefined && (obj.perform_tip_touch = message.perform_tip_touch);
    message.tip_touch_side !== undefined && (obj.tip_touch_side = message.tip_touch_side);
    message.tip_touch_retract_distance !== undefined &&
      (obj.tip_touch_retract_distance = message.tip_touch_retract_distance);
    message.tip_touch_horizonal_offset !== undefined &&
      (obj.tip_touch_horizonal_offset = message.tip_touch_horizonal_offset);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Aspirate>, I>>(base?: I): Command_Aspirate {
    return Command_Aspirate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Aspirate>, I>>(object: I): Command_Aspirate {
    const message = createBaseCommand_Aspirate();
    message.location = object.location ?? 0;
    message.volume = object.volume ?? 0;
    message.pre_aspirate_volume = object.pre_aspirate_volume ?? 0;
    message.post_aspirate_volume = object.post_aspirate_volume ?? 0;
    message.liquid_class = object.liquid_class ?? "";
    message.distance_from_well_bottom = object.distance_from_well_bottom ?? 0;
    message.retract_distance_per_microliter = object.retract_distance_per_microliter ?? 0;
    message.pipette_technique = object.pipette_technique ?? "";
    message.perform_tip_touch = object.perform_tip_touch ?? false;
    message.tip_touch_side = object.tip_touch_side ?? "";
    message.tip_touch_retract_distance = object.tip_touch_retract_distance ?? 0;
    message.tip_touch_horizonal_offset = object.tip_touch_horizonal_offset ?? 0;
    return message;
  },
};

function createBaseCommand_Dispense(): Command_Dispense {
  return {
    location: 0,
    empty_tips: false,
    volume: 0,
    blow_out_volume: 0,
    liquid_class: "",
    distance_from_well_bottom: 0,
    retract_distance_per_microliter: 0,
    pipette_technique: "",
    perform_tip_touch: false,
    tip_touch_side: "",
    tip_touch_retract_distance: 0,
    tip_touch_horizonal_offset: 0,
  };
}

export const Command_Dispense = {
  encode(message: Command_Dispense, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.location !== 0) {
      writer.uint32(8).int32(message.location);
    }
    if (message.empty_tips === true) {
      writer.uint32(16).bool(message.empty_tips);
    }
    if (message.volume !== 0) {
      writer.uint32(29).float(message.volume);
    }
    if (message.blow_out_volume !== 0) {
      writer.uint32(37).float(message.blow_out_volume);
    }
    if (message.liquid_class !== "") {
      writer.uint32(50).string(message.liquid_class);
    }
    if (message.distance_from_well_bottom !== 0) {
      writer.uint32(61).float(message.distance_from_well_bottom);
    }
    if (message.retract_distance_per_microliter !== 0) {
      writer.uint32(69).float(message.retract_distance_per_microliter);
    }
    if (message.pipette_technique !== "") {
      writer.uint32(74).string(message.pipette_technique);
    }
    if (message.perform_tip_touch === true) {
      writer.uint32(80).bool(message.perform_tip_touch);
    }
    if (message.tip_touch_side !== "") {
      writer.uint32(90).string(message.tip_touch_side);
    }
    if (message.tip_touch_retract_distance !== 0) {
      writer.uint32(101).float(message.tip_touch_retract_distance);
    }
    if (message.tip_touch_horizonal_offset !== 0) {
      writer.uint32(109).float(message.tip_touch_horizonal_offset);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Dispense {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Dispense();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.location = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.empty_tips = reader.bool();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.volume = reader.float();
          continue;
        case 4:
          if (tag !== 37) {
            break;
          }

          message.blow_out_volume = reader.float();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.liquid_class = reader.string();
          continue;
        case 7:
          if (tag !== 61) {
            break;
          }

          message.distance_from_well_bottom = reader.float();
          continue;
        case 8:
          if (tag !== 69) {
            break;
          }

          message.retract_distance_per_microliter = reader.float();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.pipette_technique = reader.string();
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.perform_tip_touch = reader.bool();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.tip_touch_side = reader.string();
          continue;
        case 12:
          if (tag !== 101) {
            break;
          }

          message.tip_touch_retract_distance = reader.float();
          continue;
        case 13:
          if (tag !== 109) {
            break;
          }

          message.tip_touch_horizonal_offset = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Dispense {
    return {
      location: isSet(object.location) ? Number(object.location) : 0,
      empty_tips: isSet(object.empty_tips) ? Boolean(object.empty_tips) : false,
      volume: isSet(object.volume) ? Number(object.volume) : 0,
      blow_out_volume: isSet(object.blow_out_volume) ? Number(object.blow_out_volume) : 0,
      liquid_class: isSet(object.liquid_class) ? String(object.liquid_class) : "",
      distance_from_well_bottom: isSet(object.distance_from_well_bottom) ? Number(object.distance_from_well_bottom) : 0,
      retract_distance_per_microliter: isSet(object.retract_distance_per_microliter)
        ? Number(object.retract_distance_per_microliter)
        : 0,
      pipette_technique: isSet(object.pipette_technique) ? String(object.pipette_technique) : "",
      perform_tip_touch: isSet(object.perform_tip_touch) ? Boolean(object.perform_tip_touch) : false,
      tip_touch_side: isSet(object.tip_touch_side) ? String(object.tip_touch_side) : "",
      tip_touch_retract_distance: isSet(object.tip_touch_retract_distance)
        ? Number(object.tip_touch_retract_distance)
        : 0,
      tip_touch_horizonal_offset: isSet(object.tip_touch_horizonal_offset)
        ? Number(object.tip_touch_horizonal_offset)
        : 0,
    };
  },

  toJSON(message: Command_Dispense): unknown {
    const obj: any = {};
    message.location !== undefined && (obj.location = Math.round(message.location));
    message.empty_tips !== undefined && (obj.empty_tips = message.empty_tips);
    message.volume !== undefined && (obj.volume = message.volume);
    message.blow_out_volume !== undefined && (obj.blow_out_volume = message.blow_out_volume);
    message.liquid_class !== undefined && (obj.liquid_class = message.liquid_class);
    message.distance_from_well_bottom !== undefined &&
      (obj.distance_from_well_bottom = message.distance_from_well_bottom);
    message.retract_distance_per_microliter !== undefined &&
      (obj.retract_distance_per_microliter = message.retract_distance_per_microliter);
    message.pipette_technique !== undefined && (obj.pipette_technique = message.pipette_technique);
    message.perform_tip_touch !== undefined && (obj.perform_tip_touch = message.perform_tip_touch);
    message.tip_touch_side !== undefined && (obj.tip_touch_side = message.tip_touch_side);
    message.tip_touch_retract_distance !== undefined &&
      (obj.tip_touch_retract_distance = message.tip_touch_retract_distance);
    message.tip_touch_horizonal_offset !== undefined &&
      (obj.tip_touch_horizonal_offset = message.tip_touch_horizonal_offset);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Dispense>, I>>(base?: I): Command_Dispense {
    return Command_Dispense.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Dispense>, I>>(object: I): Command_Dispense {
    const message = createBaseCommand_Dispense();
    message.location = object.location ?? 0;
    message.empty_tips = object.empty_tips ?? false;
    message.volume = object.volume ?? 0;
    message.blow_out_volume = object.blow_out_volume ?? 0;
    message.liquid_class = object.liquid_class ?? "";
    message.distance_from_well_bottom = object.distance_from_well_bottom ?? 0;
    message.retract_distance_per_microliter = object.retract_distance_per_microliter ?? 0;
    message.pipette_technique = object.pipette_technique ?? "";
    message.perform_tip_touch = object.perform_tip_touch ?? false;
    message.tip_touch_side = object.tip_touch_side ?? "";
    message.tip_touch_retract_distance = object.tip_touch_retract_distance ?? 0;
    message.tip_touch_horizonal_offset = object.tip_touch_horizonal_offset ?? 0;
    return message;
  },
};

function createBaseCommand_TipsOn(): Command_TipsOn {
  return { plate_location: 0 };
}

export const Command_TipsOn = {
  encode(message: Command_TipsOn, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plate_location !== 0) {
      writer.uint32(8).int32(message.plate_location);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_TipsOn {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_TipsOn();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.plate_location = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_TipsOn {
    return { plate_location: isSet(object.plate_location) ? Number(object.plate_location) : 0 };
  },

  toJSON(message: Command_TipsOn): unknown {
    const obj: any = {};
    message.plate_location !== undefined && (obj.plate_location = Math.round(message.plate_location));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_TipsOn>, I>>(base?: I): Command_TipsOn {
    return Command_TipsOn.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_TipsOn>, I>>(object: I): Command_TipsOn {
    const message = createBaseCommand_TipsOn();
    message.plate_location = object.plate_location ?? 0;
    return message;
  },
};

function createBaseCommand_TipsOff(): Command_TipsOff {
  return { plate_location: 0 };
}

export const Command_TipsOff = {
  encode(message: Command_TipsOff, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plate_location !== 0) {
      writer.uint32(8).int32(message.plate_location);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_TipsOff {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_TipsOff();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.plate_location = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_TipsOff {
    return { plate_location: isSet(object.plate_location) ? Number(object.plate_location) : 0 };
  },

  toJSON(message: Command_TipsOff): unknown {
    const obj: any = {};
    message.plate_location !== undefined && (obj.plate_location = Math.round(message.plate_location));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_TipsOff>, I>>(base?: I): Command_TipsOff {
    return Command_TipsOff.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_TipsOff>, I>>(object: I): Command_TipsOff {
    const message = createBaseCommand_TipsOff();
    message.plate_location = object.plate_location ?? 0;
    return message;
  },
};

function createBaseCommand_MoveToLocation(): Command_MoveToLocation {
  return { plate_location: 0 };
}

export const Command_MoveToLocation = {
  encode(message: Command_MoveToLocation, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plate_location !== 0) {
      writer.uint32(8).int32(message.plate_location);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_MoveToLocation {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_MoveToLocation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.plate_location = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_MoveToLocation {
    return { plate_location: isSet(object.plate_location) ? Number(object.plate_location) : 0 };
  },

  toJSON(message: Command_MoveToLocation): unknown {
    const obj: any = {};
    message.plate_location !== undefined && (obj.plate_location = Math.round(message.plate_location));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_MoveToLocation>, I>>(base?: I): Command_MoveToLocation {
    return Command_MoveToLocation.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_MoveToLocation>, I>>(object: I): Command_MoveToLocation {
    const message = createBaseCommand_MoveToLocation();
    message.plate_location = object.plate_location ?? 0;
    return message;
  },
};

function createBaseCommand_ShowDiagnostics(): Command_ShowDiagnostics {
  return {};
}

export const Command_ShowDiagnostics = {
  encode(_: Command_ShowDiagnostics, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_ShowDiagnostics {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_ShowDiagnostics();
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

  fromJSON(_: any): Command_ShowDiagnostics {
    return {};
  },

  toJSON(_: Command_ShowDiagnostics): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_ShowDiagnostics>, I>>(base?: I): Command_ShowDiagnostics {
    return Command_ShowDiagnostics.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ShowDiagnostics>, I>>(_: I): Command_ShowDiagnostics {
    const message = createBaseCommand_ShowDiagnostics();
    return message;
  },
};

function createBaseCommand_ConfigureDeck(): Command_ConfigureDeck {
  return { deck_configuration: undefined };
}

export const Command_ConfigureDeck = {
  encode(message: Command_ConfigureDeck, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.deck_configuration !== undefined) {
      Struct.encode(Struct.wrap(message.deck_configuration), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_ConfigureDeck {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_ConfigureDeck();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break;
          }

          message.deck_configuration = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_ConfigureDeck {
    return { deck_configuration: isObject(object.deck_configuration) ? object.deck_configuration : undefined };
  },

  toJSON(message: Command_ConfigureDeck): unknown {
    const obj: any = {};
    message.deck_configuration !== undefined && (obj.deck_configuration = message.deck_configuration);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_ConfigureDeck>, I>>(base?: I): Command_ConfigureDeck {
    return Command_ConfigureDeck.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ConfigureDeck>, I>>(object: I): Command_ConfigureDeck {
    const message = createBaseCommand_ConfigureDeck();
    message.deck_configuration = object.deck_configuration ?? undefined;
    return message;
  },
};

function createBaseResponse(): Response {
  return {
    success: undefined,
    error: undefined,
    device_configuration: undefined,
    firmware_version: undefined,
    profiles_list: undefined,
  };
}

export const Response = {
  encode(message: Response, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.success !== undefined) {
      Response_Success.encode(message.success, writer.uint32(10).fork()).ldelim();
    }
    if (message.error !== undefined) {
      Response_Error.encode(message.error, writer.uint32(18).fork()).ldelim();
    }
    if (message.device_configuration !== undefined) {
      Response_DeviceConfiguration.encode(message.device_configuration, writer.uint32(26).fork()).ldelim();
    }
    if (message.firmware_version !== undefined) {
      Response_FirmwareVersion.encode(message.firmware_version, writer.uint32(34).fork()).ldelim();
    }
    if (message.profiles_list !== undefined) {
      Response_ProfilesList.encode(message.profiles_list, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Response {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.success = Response_Success.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.error = Response_Error.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.device_configuration = Response_DeviceConfiguration.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.firmware_version = Response_FirmwareVersion.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.profiles_list = Response_ProfilesList.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Response {
    return {
      success: isSet(object.success) ? Response_Success.fromJSON(object.success) : undefined,
      error: isSet(object.error) ? Response_Error.fromJSON(object.error) : undefined,
      device_configuration: isSet(object.device_configuration)
        ? Response_DeviceConfiguration.fromJSON(object.device_configuration)
        : undefined,
      firmware_version: isSet(object.firmware_version)
        ? Response_FirmwareVersion.fromJSON(object.firmware_version)
        : undefined,
      profiles_list: isSet(object.profiles_list) ? Response_ProfilesList.fromJSON(object.profiles_list) : undefined,
    };
  },

  toJSON(message: Response): unknown {
    const obj: any = {};
    message.success !== undefined &&
      (obj.success = message.success ? Response_Success.toJSON(message.success) : undefined);
    message.error !== undefined && (obj.error = message.error ? Response_Error.toJSON(message.error) : undefined);
    message.device_configuration !== undefined && (obj.device_configuration = message.device_configuration
      ? Response_DeviceConfiguration.toJSON(message.device_configuration)
      : undefined);
    message.firmware_version !== undefined && (obj.firmware_version = message.firmware_version
      ? Response_FirmwareVersion.toJSON(message.firmware_version)
      : undefined);
    message.profiles_list !== undefined &&
      (obj.profiles_list = message.profiles_list ? Response_ProfilesList.toJSON(message.profiles_list) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Response>, I>>(base?: I): Response {
    return Response.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Response>, I>>(object: I): Response {
    const message = createBaseResponse();
    message.success = (object.success !== undefined && object.success !== null)
      ? Response_Success.fromPartial(object.success)
      : undefined;
    message.error = (object.error !== undefined && object.error !== null)
      ? Response_Error.fromPartial(object.error)
      : undefined;
    message.device_configuration = (object.device_configuration !== undefined && object.device_configuration !== null)
      ? Response_DeviceConfiguration.fromPartial(object.device_configuration)
      : undefined;
    message.firmware_version = (object.firmware_version !== undefined && object.firmware_version !== null)
      ? Response_FirmwareVersion.fromPartial(object.firmware_version)
      : undefined;
    message.profiles_list = (object.profiles_list !== undefined && object.profiles_list !== null)
      ? Response_ProfilesList.fromPartial(object.profiles_list)
      : undefined;
    return message;
  },
};

function createBaseResponse_Success(): Response_Success {
  return { message: "" };
}

export const Response_Success = {
  encode(message: Response_Success, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Response_Success {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponse_Success();
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

  fromJSON(object: any): Response_Success {
    return { message: isSet(object.message) ? String(object.message) : "" };
  },

  toJSON(message: Response_Success): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    return obj;
  },

  create<I extends Exact<DeepPartial<Response_Success>, I>>(base?: I): Response_Success {
    return Response_Success.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Response_Success>, I>>(object: I): Response_Success {
    const message = createBaseResponse_Success();
    message.message = object.message ?? "";
    return message;
  },
};

function createBaseResponse_Error(): Response_Error {
  return { error_message: "", error_code: 0 };
}

export const Response_Error = {
  encode(message: Response_Error, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.error_message !== "") {
      writer.uint32(10).string(message.error_message);
    }
    if (message.error_code !== 0) {
      writer.uint32(16).int32(message.error_code);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Response_Error {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponse_Error();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.error_message = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.error_code = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Response_Error {
    return {
      error_message: isSet(object.error_message) ? String(object.error_message) : "",
      error_code: isSet(object.error_code) ? Number(object.error_code) : 0,
    };
  },

  toJSON(message: Response_Error): unknown {
    const obj: any = {};
    message.error_message !== undefined && (obj.error_message = message.error_message);
    message.error_code !== undefined && (obj.error_code = Math.round(message.error_code));
    return obj;
  },

  create<I extends Exact<DeepPartial<Response_Error>, I>>(base?: I): Response_Error {
    return Response_Error.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Response_Error>, I>>(object: I): Response_Error {
    const message = createBaseResponse_Error();
    message.error_message = object.error_message ?? "";
    message.error_code = object.error_code ?? 0;
    return message;
  },
};

function createBaseResponse_DeviceConfiguration(): Response_DeviceConfiguration {
  return { configuration: "" };
}

export const Response_DeviceConfiguration = {
  encode(message: Response_DeviceConfiguration, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.configuration !== "") {
      writer.uint32(10).string(message.configuration);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Response_DeviceConfiguration {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponse_DeviceConfiguration();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.configuration = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Response_DeviceConfiguration {
    return { configuration: isSet(object.configuration) ? String(object.configuration) : "" };
  },

  toJSON(message: Response_DeviceConfiguration): unknown {
    const obj: any = {};
    message.configuration !== undefined && (obj.configuration = message.configuration);
    return obj;
  },

  create<I extends Exact<DeepPartial<Response_DeviceConfiguration>, I>>(base?: I): Response_DeviceConfiguration {
    return Response_DeviceConfiguration.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Response_DeviceConfiguration>, I>>(object: I): Response_DeviceConfiguration {
    const message = createBaseResponse_DeviceConfiguration();
    message.configuration = object.configuration ?? "";
    return message;
  },
};

function createBaseResponse_FirmwareVersion(): Response_FirmwareVersion {
  return { version: "" };
}

export const Response_FirmwareVersion = {
  encode(message: Response_FirmwareVersion, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.version !== "") {
      writer.uint32(10).string(message.version);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Response_FirmwareVersion {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponse_FirmwareVersion();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.version = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Response_FirmwareVersion {
    return { version: isSet(object.version) ? String(object.version) : "" };
  },

  toJSON(message: Response_FirmwareVersion): unknown {
    const obj: any = {};
    message.version !== undefined && (obj.version = message.version);
    return obj;
  },

  create<I extends Exact<DeepPartial<Response_FirmwareVersion>, I>>(base?: I): Response_FirmwareVersion {
    return Response_FirmwareVersion.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Response_FirmwareVersion>, I>>(object: I): Response_FirmwareVersion {
    const message = createBaseResponse_FirmwareVersion();
    message.version = object.version ?? "";
    return message;
  },
};

function createBaseResponse_ProfilesList(): Response_ProfilesList {
  return { profiles: [] };
}

export const Response_ProfilesList = {
  encode(message: Response_ProfilesList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.profiles) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Response_ProfilesList {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponse_ProfilesList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.profiles.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Response_ProfilesList {
    return { profiles: Array.isArray(object?.profiles) ? object.profiles.map((e: any) => String(e)) : [] };
  },

  toJSON(message: Response_ProfilesList): unknown {
    const obj: any = {};
    if (message.profiles) {
      obj.profiles = message.profiles.map((e) => e);
    } else {
      obj.profiles = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Response_ProfilesList>, I>>(base?: I): Response_ProfilesList {
    return Response_ProfilesList.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Response_ProfilesList>, I>>(object: I): Response_ProfilesList {
    const message = createBaseResponse_ProfilesList();
    message.profiles = object.profiles?.map((e) => e) || [];
    return message;
  },
};

function createBaseConfig(): Config {
  return { device_file: "" };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.device_file !== "") {
      writer.uint32(10).string(message.device_file);
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

          message.device_file = reader.string();
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
    return { device_file: isSet(object.device_file) ? String(object.device_file) : "" };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.device_file !== undefined && (obj.device_file = message.device_file);
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.device_file = object.device_file ?? "";
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
