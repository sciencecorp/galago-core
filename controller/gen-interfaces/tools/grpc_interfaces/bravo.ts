/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.bravo";

export interface Command {
  initialize?: Command_Initialize | undefined;
  close?: Command_Close | undefined;
  home_w?: Command_HomeW | undefined;
  home_xyz?: Command_HomeXYZ | undefined;
  mix?: Command_Mix | undefined;
  wash?: Command_Wash | undefined;
  aspirate?: Command_Aspirate | undefined;
  dispense?: Command_Dispense | undefined;
  tips_on?: Command_TipsOn | undefined;
  tips_off?: Command_TipsOff | undefined;
  move_to_location?: Command_MoveToLocation | undefined;
  set_labware_at_location?: Command_SetLabwareAtLocation | undefined;
  set_liquid_class?: Command_SetLiquidClass | undefined;
  pick_and_place?: Command_PickAndPlace | undefined;
  get_device_configuration?: Command_GetDeviceConfiguration | undefined;
  get_firmware_version?: Command_GetFirmwareVersion | undefined;
  enumerate_profiles?: Command_EnumerateProfiles | undefined;
  show_diagnostics?: Command_ShowDiagnostics | undefined;
}

export interface Command_Initialize {
  profile: string;
}

export interface Command_Close {
}

export interface Command_HomeW {
}

export interface Command_HomeXYZ {
}

export interface Command_Mix {
  volume: number;
  pre_aspirate_volume: number;
  blow_out_volume: number;
  cycles: number;
  plate_location: number;
  distance_from_well_bottom: number;
  retract_distance_per_microliter: number;
}

export interface Command_Wash {
  volume: number;
  empty_tips: boolean;
  pre_aspirate_volume: number;
  blow_out_volume: number;
  cycles: number;
  plate_location: number;
  distance_from_well_bottom: number;
  retract_distance_per_microliter: number;
  pump_in_flow_speed: number;
  pump_out_flow_speed: number;
}

export interface Command_Aspirate {
  volume: number;
  plate_location: number;
  distance_from_well_bottom?: number | undefined;
  pre_aspirate_volume?: number | undefined;
  post_aspirate_volume?: number | undefined;
  retract_distance_per_microliter?: number | undefined;
}

export interface Command_Dispense {
  volume: number;
  empty_tips: boolean;
  blow_out_volume: number;
  plate_location: number;
  distance_from_well_bottom?: number | undefined;
  retract_distance_per_microliter?: number | undefined;
}

export interface Command_TipsOn {
  plate_location: number;
}

export interface Command_TipsOff {
  plate_location: number;
}

export interface Command_MoveToLocation {
  plate_location: number;
  only_z?: boolean | undefined;
}

export interface Command_SetLabwareAtLocation {
  plate_location: number;
  labware_type: string;
}

export interface Command_SetLiquidClass {
  liquid_class: string;
}

export interface Command_PickAndPlace {
  source_location: number;
  dest_location: number;
  gripper_offset: number;
  labware_thickness: number;
}

export interface Command_GetDeviceConfiguration {
}

export interface Command_GetFirmwareVersion {
}

export interface Command_EnumerateProfiles {
}

export interface Command_ShowDiagnostics {
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
  profile: string;
}

function createBaseCommand(): Command {
  return {
    initialize: undefined,
    close: undefined,
    home_w: undefined,
    home_xyz: undefined,
    mix: undefined,
    wash: undefined,
    aspirate: undefined,
    dispense: undefined,
    tips_on: undefined,
    tips_off: undefined,
    move_to_location: undefined,
    set_labware_at_location: undefined,
    set_liquid_class: undefined,
    pick_and_place: undefined,
    get_device_configuration: undefined,
    get_firmware_version: undefined,
    enumerate_profiles: undefined,
    show_diagnostics: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.initialize !== undefined) {
      Command_Initialize.encode(message.initialize, writer.uint32(10).fork()).ldelim();
    }
    if (message.close !== undefined) {
      Command_Close.encode(message.close, writer.uint32(18).fork()).ldelim();
    }
    if (message.home_w !== undefined) {
      Command_HomeW.encode(message.home_w, writer.uint32(26).fork()).ldelim();
    }
    if (message.home_xyz !== undefined) {
      Command_HomeXYZ.encode(message.home_xyz, writer.uint32(34).fork()).ldelim();
    }
    if (message.mix !== undefined) {
      Command_Mix.encode(message.mix, writer.uint32(42).fork()).ldelim();
    }
    if (message.wash !== undefined) {
      Command_Wash.encode(message.wash, writer.uint32(50).fork()).ldelim();
    }
    if (message.aspirate !== undefined) {
      Command_Aspirate.encode(message.aspirate, writer.uint32(58).fork()).ldelim();
    }
    if (message.dispense !== undefined) {
      Command_Dispense.encode(message.dispense, writer.uint32(66).fork()).ldelim();
    }
    if (message.tips_on !== undefined) {
      Command_TipsOn.encode(message.tips_on, writer.uint32(74).fork()).ldelim();
    }
    if (message.tips_off !== undefined) {
      Command_TipsOff.encode(message.tips_off, writer.uint32(82).fork()).ldelim();
    }
    if (message.move_to_location !== undefined) {
      Command_MoveToLocation.encode(message.move_to_location, writer.uint32(90).fork()).ldelim();
    }
    if (message.set_labware_at_location !== undefined) {
      Command_SetLabwareAtLocation.encode(message.set_labware_at_location, writer.uint32(98).fork()).ldelim();
    }
    if (message.set_liquid_class !== undefined) {
      Command_SetLiquidClass.encode(message.set_liquid_class, writer.uint32(106).fork()).ldelim();
    }
    if (message.pick_and_place !== undefined) {
      Command_PickAndPlace.encode(message.pick_and_place, writer.uint32(114).fork()).ldelim();
    }
    if (message.get_device_configuration !== undefined) {
      Command_GetDeviceConfiguration.encode(message.get_device_configuration, writer.uint32(122).fork()).ldelim();
    }
    if (message.get_firmware_version !== undefined) {
      Command_GetFirmwareVersion.encode(message.get_firmware_version, writer.uint32(130).fork()).ldelim();
    }
    if (message.enumerate_profiles !== undefined) {
      Command_EnumerateProfiles.encode(message.enumerate_profiles, writer.uint32(138).fork()).ldelim();
    }
    if (message.show_diagnostics !== undefined) {
      Command_ShowDiagnostics.encode(message.show_diagnostics, writer.uint32(146).fork()).ldelim();
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

          message.initialize = Command_Initialize.decode(reader, reader.uint32());
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

          message.home_w = Command_HomeW.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.home_xyz = Command_HomeXYZ.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.mix = Command_Mix.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.wash = Command_Wash.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.aspirate = Command_Aspirate.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.dispense = Command_Dispense.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.tips_on = Command_TipsOn.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.tips_off = Command_TipsOff.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.move_to_location = Command_MoveToLocation.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.set_labware_at_location = Command_SetLabwareAtLocation.decode(reader, reader.uint32());
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.set_liquid_class = Command_SetLiquidClass.decode(reader, reader.uint32());
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.pick_and_place = Command_PickAndPlace.decode(reader, reader.uint32());
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.get_device_configuration = Command_GetDeviceConfiguration.decode(reader, reader.uint32());
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.get_firmware_version = Command_GetFirmwareVersion.decode(reader, reader.uint32());
          continue;
        case 17:
          if (tag !== 138) {
            break;
          }

          message.enumerate_profiles = Command_EnumerateProfiles.decode(reader, reader.uint32());
          continue;
        case 18:
          if (tag !== 146) {
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
      initialize: isSet(object.initialize) ? Command_Initialize.fromJSON(object.initialize) : undefined,
      close: isSet(object.close) ? Command_Close.fromJSON(object.close) : undefined,
      home_w: isSet(object.home_w) ? Command_HomeW.fromJSON(object.home_w) : undefined,
      home_xyz: isSet(object.home_xyz) ? Command_HomeXYZ.fromJSON(object.home_xyz) : undefined,
      mix: isSet(object.mix) ? Command_Mix.fromJSON(object.mix) : undefined,
      wash: isSet(object.wash) ? Command_Wash.fromJSON(object.wash) : undefined,
      aspirate: isSet(object.aspirate) ? Command_Aspirate.fromJSON(object.aspirate) : undefined,
      dispense: isSet(object.dispense) ? Command_Dispense.fromJSON(object.dispense) : undefined,
      tips_on: isSet(object.tips_on) ? Command_TipsOn.fromJSON(object.tips_on) : undefined,
      tips_off: isSet(object.tips_off) ? Command_TipsOff.fromJSON(object.tips_off) : undefined,
      move_to_location: isSet(object.move_to_location)
        ? Command_MoveToLocation.fromJSON(object.move_to_location)
        : undefined,
      set_labware_at_location: isSet(object.set_labware_at_location)
        ? Command_SetLabwareAtLocation.fromJSON(object.set_labware_at_location)
        : undefined,
      set_liquid_class: isSet(object.set_liquid_class)
        ? Command_SetLiquidClass.fromJSON(object.set_liquid_class)
        : undefined,
      pick_and_place: isSet(object.pick_and_place) ? Command_PickAndPlace.fromJSON(object.pick_and_place) : undefined,
      get_device_configuration: isSet(object.get_device_configuration)
        ? Command_GetDeviceConfiguration.fromJSON(object.get_device_configuration)
        : undefined,
      get_firmware_version: isSet(object.get_firmware_version)
        ? Command_GetFirmwareVersion.fromJSON(object.get_firmware_version)
        : undefined,
      enumerate_profiles: isSet(object.enumerate_profiles)
        ? Command_EnumerateProfiles.fromJSON(object.enumerate_profiles)
        : undefined,
      show_diagnostics: isSet(object.show_diagnostics)
        ? Command_ShowDiagnostics.fromJSON(object.show_diagnostics)
        : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.initialize !== undefined &&
      (obj.initialize = message.initialize ? Command_Initialize.toJSON(message.initialize) : undefined);
    message.close !== undefined && (obj.close = message.close ? Command_Close.toJSON(message.close) : undefined);
    message.home_w !== undefined && (obj.home_w = message.home_w ? Command_HomeW.toJSON(message.home_w) : undefined);
    message.home_xyz !== undefined &&
      (obj.home_xyz = message.home_xyz ? Command_HomeXYZ.toJSON(message.home_xyz) : undefined);
    message.mix !== undefined && (obj.mix = message.mix ? Command_Mix.toJSON(message.mix) : undefined);
    message.wash !== undefined && (obj.wash = message.wash ? Command_Wash.toJSON(message.wash) : undefined);
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
    message.set_labware_at_location !== undefined && (obj.set_labware_at_location = message.set_labware_at_location
      ? Command_SetLabwareAtLocation.toJSON(message.set_labware_at_location)
      : undefined);
    message.set_liquid_class !== undefined && (obj.set_liquid_class = message.set_liquid_class
      ? Command_SetLiquidClass.toJSON(message.set_liquid_class)
      : undefined);
    message.pick_and_place !== undefined &&
      (obj.pick_and_place = message.pick_and_place ? Command_PickAndPlace.toJSON(message.pick_and_place) : undefined);
    message.get_device_configuration !== undefined && (obj.get_device_configuration = message.get_device_configuration
      ? Command_GetDeviceConfiguration.toJSON(message.get_device_configuration)
      : undefined);
    message.get_firmware_version !== undefined && (obj.get_firmware_version = message.get_firmware_version
      ? Command_GetFirmwareVersion.toJSON(message.get_firmware_version)
      : undefined);
    message.enumerate_profiles !== undefined && (obj.enumerate_profiles = message.enumerate_profiles
      ? Command_EnumerateProfiles.toJSON(message.enumerate_profiles)
      : undefined);
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
    message.initialize = (object.initialize !== undefined && object.initialize !== null)
      ? Command_Initialize.fromPartial(object.initialize)
      : undefined;
    message.close = (object.close !== undefined && object.close !== null)
      ? Command_Close.fromPartial(object.close)
      : undefined;
    message.home_w = (object.home_w !== undefined && object.home_w !== null)
      ? Command_HomeW.fromPartial(object.home_w)
      : undefined;
    message.home_xyz = (object.home_xyz !== undefined && object.home_xyz !== null)
      ? Command_HomeXYZ.fromPartial(object.home_xyz)
      : undefined;
    message.mix = (object.mix !== undefined && object.mix !== null) ? Command_Mix.fromPartial(object.mix) : undefined;
    message.wash = (object.wash !== undefined && object.wash !== null)
      ? Command_Wash.fromPartial(object.wash)
      : undefined;
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
    message.set_labware_at_location =
      (object.set_labware_at_location !== undefined && object.set_labware_at_location !== null)
        ? Command_SetLabwareAtLocation.fromPartial(object.set_labware_at_location)
        : undefined;
    message.set_liquid_class = (object.set_liquid_class !== undefined && object.set_liquid_class !== null)
      ? Command_SetLiquidClass.fromPartial(object.set_liquid_class)
      : undefined;
    message.pick_and_place = (object.pick_and_place !== undefined && object.pick_and_place !== null)
      ? Command_PickAndPlace.fromPartial(object.pick_and_place)
      : undefined;
    message.get_device_configuration =
      (object.get_device_configuration !== undefined && object.get_device_configuration !== null)
        ? Command_GetDeviceConfiguration.fromPartial(object.get_device_configuration)
        : undefined;
    message.get_firmware_version = (object.get_firmware_version !== undefined && object.get_firmware_version !== null)
      ? Command_GetFirmwareVersion.fromPartial(object.get_firmware_version)
      : undefined;
    message.enumerate_profiles = (object.enumerate_profiles !== undefined && object.enumerate_profiles !== null)
      ? Command_EnumerateProfiles.fromPartial(object.enumerate_profiles)
      : undefined;
    message.show_diagnostics = (object.show_diagnostics !== undefined && object.show_diagnostics !== null)
      ? Command_ShowDiagnostics.fromPartial(object.show_diagnostics)
      : undefined;
    return message;
  },
};

function createBaseCommand_Initialize(): Command_Initialize {
  return { profile: "" };
}

export const Command_Initialize = {
  encode(message: Command_Initialize, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.profile !== "") {
      writer.uint32(10).string(message.profile);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Initialize {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Initialize();
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

  fromJSON(object: any): Command_Initialize {
    return { profile: isSet(object.profile) ? String(object.profile) : "" };
  },

  toJSON(message: Command_Initialize): unknown {
    const obj: any = {};
    message.profile !== undefined && (obj.profile = message.profile);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Initialize>, I>>(base?: I): Command_Initialize {
    return Command_Initialize.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Initialize>, I>>(object: I): Command_Initialize {
    const message = createBaseCommand_Initialize();
    message.profile = object.profile ?? "";
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

function createBaseCommand_HomeW(): Command_HomeW {
  return {};
}

export const Command_HomeW = {
  encode(_: Command_HomeW, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_HomeW {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_HomeW();
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

  fromJSON(_: any): Command_HomeW {
    return {};
  },

  toJSON(_: Command_HomeW): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_HomeW>, I>>(base?: I): Command_HomeW {
    return Command_HomeW.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_HomeW>, I>>(_: I): Command_HomeW {
    const message = createBaseCommand_HomeW();
    return message;
  },
};

function createBaseCommand_HomeXYZ(): Command_HomeXYZ {
  return {};
}

export const Command_HomeXYZ = {
  encode(_: Command_HomeXYZ, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_HomeXYZ {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_HomeXYZ();
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

  fromJSON(_: any): Command_HomeXYZ {
    return {};
  },

  toJSON(_: Command_HomeXYZ): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_HomeXYZ>, I>>(base?: I): Command_HomeXYZ {
    return Command_HomeXYZ.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_HomeXYZ>, I>>(_: I): Command_HomeXYZ {
    const message = createBaseCommand_HomeXYZ();
    return message;
  },
};

function createBaseCommand_Mix(): Command_Mix {
  return {
    volume: 0,
    pre_aspirate_volume: 0,
    blow_out_volume: 0,
    cycles: 0,
    plate_location: 0,
    distance_from_well_bottom: 0,
    retract_distance_per_microliter: 0,
  };
}

export const Command_Mix = {
  encode(message: Command_Mix, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.volume !== 0) {
      writer.uint32(13).float(message.volume);
    }
    if (message.pre_aspirate_volume !== 0) {
      writer.uint32(21).float(message.pre_aspirate_volume);
    }
    if (message.blow_out_volume !== 0) {
      writer.uint32(29).float(message.blow_out_volume);
    }
    if (message.cycles !== 0) {
      writer.uint32(32).int32(message.cycles);
    }
    if (message.plate_location !== 0) {
      writer.uint32(40).int32(message.plate_location);
    }
    if (message.distance_from_well_bottom !== 0) {
      writer.uint32(53).float(message.distance_from_well_bottom);
    }
    if (message.retract_distance_per_microliter !== 0) {
      writer.uint32(61).float(message.retract_distance_per_microliter);
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
          if (tag !== 13) {
            break;
          }

          message.volume = reader.float();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.pre_aspirate_volume = reader.float();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.blow_out_volume = reader.float();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.cycles = reader.int32();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.plate_location = reader.int32();
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
      volume: isSet(object.volume) ? Number(object.volume) : 0,
      pre_aspirate_volume: isSet(object.pre_aspirate_volume) ? Number(object.pre_aspirate_volume) : 0,
      blow_out_volume: isSet(object.blow_out_volume) ? Number(object.blow_out_volume) : 0,
      cycles: isSet(object.cycles) ? Number(object.cycles) : 0,
      plate_location: isSet(object.plate_location) ? Number(object.plate_location) : 0,
      distance_from_well_bottom: isSet(object.distance_from_well_bottom) ? Number(object.distance_from_well_bottom) : 0,
      retract_distance_per_microliter: isSet(object.retract_distance_per_microliter)
        ? Number(object.retract_distance_per_microliter)
        : 0,
    };
  },

  toJSON(message: Command_Mix): unknown {
    const obj: any = {};
    message.volume !== undefined && (obj.volume = message.volume);
    message.pre_aspirate_volume !== undefined && (obj.pre_aspirate_volume = message.pre_aspirate_volume);
    message.blow_out_volume !== undefined && (obj.blow_out_volume = message.blow_out_volume);
    message.cycles !== undefined && (obj.cycles = Math.round(message.cycles));
    message.plate_location !== undefined && (obj.plate_location = Math.round(message.plate_location));
    message.distance_from_well_bottom !== undefined &&
      (obj.distance_from_well_bottom = message.distance_from_well_bottom);
    message.retract_distance_per_microliter !== undefined &&
      (obj.retract_distance_per_microliter = message.retract_distance_per_microliter);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Mix>, I>>(base?: I): Command_Mix {
    return Command_Mix.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Mix>, I>>(object: I): Command_Mix {
    const message = createBaseCommand_Mix();
    message.volume = object.volume ?? 0;
    message.pre_aspirate_volume = object.pre_aspirate_volume ?? 0;
    message.blow_out_volume = object.blow_out_volume ?? 0;
    message.cycles = object.cycles ?? 0;
    message.plate_location = object.plate_location ?? 0;
    message.distance_from_well_bottom = object.distance_from_well_bottom ?? 0;
    message.retract_distance_per_microliter = object.retract_distance_per_microliter ?? 0;
    return message;
  },
};

function createBaseCommand_Wash(): Command_Wash {
  return {
    volume: 0,
    empty_tips: false,
    pre_aspirate_volume: 0,
    blow_out_volume: 0,
    cycles: 0,
    plate_location: 0,
    distance_from_well_bottom: 0,
    retract_distance_per_microliter: 0,
    pump_in_flow_speed: 0,
    pump_out_flow_speed: 0,
  };
}

export const Command_Wash = {
  encode(message: Command_Wash, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.volume !== 0) {
      writer.uint32(13).float(message.volume);
    }
    if (message.empty_tips === true) {
      writer.uint32(16).bool(message.empty_tips);
    }
    if (message.pre_aspirate_volume !== 0) {
      writer.uint32(29).float(message.pre_aspirate_volume);
    }
    if (message.blow_out_volume !== 0) {
      writer.uint32(37).float(message.blow_out_volume);
    }
    if (message.cycles !== 0) {
      writer.uint32(40).int32(message.cycles);
    }
    if (message.plate_location !== 0) {
      writer.uint32(48).int32(message.plate_location);
    }
    if (message.distance_from_well_bottom !== 0) {
      writer.uint32(61).float(message.distance_from_well_bottom);
    }
    if (message.retract_distance_per_microliter !== 0) {
      writer.uint32(69).float(message.retract_distance_per_microliter);
    }
    if (message.pump_in_flow_speed !== 0) {
      writer.uint32(77).float(message.pump_in_flow_speed);
    }
    if (message.pump_out_flow_speed !== 0) {
      writer.uint32(85).float(message.pump_out_flow_speed);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Wash {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Wash();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.volume = reader.float();
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

          message.pre_aspirate_volume = reader.float();
          continue;
        case 4:
          if (tag !== 37) {
            break;
          }

          message.blow_out_volume = reader.float();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.cycles = reader.int32();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.plate_location = reader.int32();
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
          if (tag !== 77) {
            break;
          }

          message.pump_in_flow_speed = reader.float();
          continue;
        case 10:
          if (tag !== 85) {
            break;
          }

          message.pump_out_flow_speed = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Wash {
    return {
      volume: isSet(object.volume) ? Number(object.volume) : 0,
      empty_tips: isSet(object.empty_tips) ? Boolean(object.empty_tips) : false,
      pre_aspirate_volume: isSet(object.pre_aspirate_volume) ? Number(object.pre_aspirate_volume) : 0,
      blow_out_volume: isSet(object.blow_out_volume) ? Number(object.blow_out_volume) : 0,
      cycles: isSet(object.cycles) ? Number(object.cycles) : 0,
      plate_location: isSet(object.plate_location) ? Number(object.plate_location) : 0,
      distance_from_well_bottom: isSet(object.distance_from_well_bottom) ? Number(object.distance_from_well_bottom) : 0,
      retract_distance_per_microliter: isSet(object.retract_distance_per_microliter)
        ? Number(object.retract_distance_per_microliter)
        : 0,
      pump_in_flow_speed: isSet(object.pump_in_flow_speed) ? Number(object.pump_in_flow_speed) : 0,
      pump_out_flow_speed: isSet(object.pump_out_flow_speed) ? Number(object.pump_out_flow_speed) : 0,
    };
  },

  toJSON(message: Command_Wash): unknown {
    const obj: any = {};
    message.volume !== undefined && (obj.volume = message.volume);
    message.empty_tips !== undefined && (obj.empty_tips = message.empty_tips);
    message.pre_aspirate_volume !== undefined && (obj.pre_aspirate_volume = message.pre_aspirate_volume);
    message.blow_out_volume !== undefined && (obj.blow_out_volume = message.blow_out_volume);
    message.cycles !== undefined && (obj.cycles = Math.round(message.cycles));
    message.plate_location !== undefined && (obj.plate_location = Math.round(message.plate_location));
    message.distance_from_well_bottom !== undefined &&
      (obj.distance_from_well_bottom = message.distance_from_well_bottom);
    message.retract_distance_per_microliter !== undefined &&
      (obj.retract_distance_per_microliter = message.retract_distance_per_microliter);
    message.pump_in_flow_speed !== undefined && (obj.pump_in_flow_speed = message.pump_in_flow_speed);
    message.pump_out_flow_speed !== undefined && (obj.pump_out_flow_speed = message.pump_out_flow_speed);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Wash>, I>>(base?: I): Command_Wash {
    return Command_Wash.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Wash>, I>>(object: I): Command_Wash {
    const message = createBaseCommand_Wash();
    message.volume = object.volume ?? 0;
    message.empty_tips = object.empty_tips ?? false;
    message.pre_aspirate_volume = object.pre_aspirate_volume ?? 0;
    message.blow_out_volume = object.blow_out_volume ?? 0;
    message.cycles = object.cycles ?? 0;
    message.plate_location = object.plate_location ?? 0;
    message.distance_from_well_bottom = object.distance_from_well_bottom ?? 0;
    message.retract_distance_per_microliter = object.retract_distance_per_microliter ?? 0;
    message.pump_in_flow_speed = object.pump_in_flow_speed ?? 0;
    message.pump_out_flow_speed = object.pump_out_flow_speed ?? 0;
    return message;
  },
};

function createBaseCommand_Aspirate(): Command_Aspirate {
  return {
    volume: 0,
    plate_location: 0,
    distance_from_well_bottom: undefined,
    pre_aspirate_volume: undefined,
    post_aspirate_volume: undefined,
    retract_distance_per_microliter: undefined,
  };
}

export const Command_Aspirate = {
  encode(message: Command_Aspirate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.volume !== 0) {
      writer.uint32(13).float(message.volume);
    }
    if (message.plate_location !== 0) {
      writer.uint32(16).int32(message.plate_location);
    }
    if (message.distance_from_well_bottom !== undefined) {
      writer.uint32(29).float(message.distance_from_well_bottom);
    }
    if (message.pre_aspirate_volume !== undefined) {
      writer.uint32(37).float(message.pre_aspirate_volume);
    }
    if (message.post_aspirate_volume !== undefined) {
      writer.uint32(45).float(message.post_aspirate_volume);
    }
    if (message.retract_distance_per_microliter !== undefined) {
      writer.uint32(53).float(message.retract_distance_per_microliter);
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
          if (tag !== 13) {
            break;
          }

          message.volume = reader.float();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.plate_location = reader.int32();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.distance_from_well_bottom = reader.float();
          continue;
        case 4:
          if (tag !== 37) {
            break;
          }

          message.pre_aspirate_volume = reader.float();
          continue;
        case 5:
          if (tag !== 45) {
            break;
          }

          message.post_aspirate_volume = reader.float();
          continue;
        case 6:
          if (tag !== 53) {
            break;
          }

          message.retract_distance_per_microliter = reader.float();
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
      volume: isSet(object.volume) ? Number(object.volume) : 0,
      plate_location: isSet(object.plate_location) ? Number(object.plate_location) : 0,
      distance_from_well_bottom: isSet(object.distance_from_well_bottom)
        ? Number(object.distance_from_well_bottom)
        : undefined,
      pre_aspirate_volume: isSet(object.pre_aspirate_volume) ? Number(object.pre_aspirate_volume) : undefined,
      post_aspirate_volume: isSet(object.post_aspirate_volume) ? Number(object.post_aspirate_volume) : undefined,
      retract_distance_per_microliter: isSet(object.retract_distance_per_microliter)
        ? Number(object.retract_distance_per_microliter)
        : undefined,
    };
  },

  toJSON(message: Command_Aspirate): unknown {
    const obj: any = {};
    message.volume !== undefined && (obj.volume = message.volume);
    message.plate_location !== undefined && (obj.plate_location = Math.round(message.plate_location));
    message.distance_from_well_bottom !== undefined &&
      (obj.distance_from_well_bottom = message.distance_from_well_bottom);
    message.pre_aspirate_volume !== undefined && (obj.pre_aspirate_volume = message.pre_aspirate_volume);
    message.post_aspirate_volume !== undefined && (obj.post_aspirate_volume = message.post_aspirate_volume);
    message.retract_distance_per_microliter !== undefined &&
      (obj.retract_distance_per_microliter = message.retract_distance_per_microliter);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Aspirate>, I>>(base?: I): Command_Aspirate {
    return Command_Aspirate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Aspirate>, I>>(object: I): Command_Aspirate {
    const message = createBaseCommand_Aspirate();
    message.volume = object.volume ?? 0;
    message.plate_location = object.plate_location ?? 0;
    message.distance_from_well_bottom = object.distance_from_well_bottom ?? undefined;
    message.pre_aspirate_volume = object.pre_aspirate_volume ?? undefined;
    message.post_aspirate_volume = object.post_aspirate_volume ?? undefined;
    message.retract_distance_per_microliter = object.retract_distance_per_microliter ?? undefined;
    return message;
  },
};

function createBaseCommand_Dispense(): Command_Dispense {
  return {
    volume: 0,
    empty_tips: false,
    blow_out_volume: 0,
    plate_location: 0,
    distance_from_well_bottom: undefined,
    retract_distance_per_microliter: undefined,
  };
}

export const Command_Dispense = {
  encode(message: Command_Dispense, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.volume !== 0) {
      writer.uint32(13).float(message.volume);
    }
    if (message.empty_tips === true) {
      writer.uint32(16).bool(message.empty_tips);
    }
    if (message.blow_out_volume !== 0) {
      writer.uint32(29).float(message.blow_out_volume);
    }
    if (message.plate_location !== 0) {
      writer.uint32(32).int32(message.plate_location);
    }
    if (message.distance_from_well_bottom !== undefined) {
      writer.uint32(45).float(message.distance_from_well_bottom);
    }
    if (message.retract_distance_per_microliter !== undefined) {
      writer.uint32(53).float(message.retract_distance_per_microliter);
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
          if (tag !== 13) {
            break;
          }

          message.volume = reader.float();
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

          message.blow_out_volume = reader.float();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.plate_location = reader.int32();
          continue;
        case 5:
          if (tag !== 45) {
            break;
          }

          message.distance_from_well_bottom = reader.float();
          continue;
        case 6:
          if (tag !== 53) {
            break;
          }

          message.retract_distance_per_microliter = reader.float();
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
      volume: isSet(object.volume) ? Number(object.volume) : 0,
      empty_tips: isSet(object.empty_tips) ? Boolean(object.empty_tips) : false,
      blow_out_volume: isSet(object.blow_out_volume) ? Number(object.blow_out_volume) : 0,
      plate_location: isSet(object.plate_location) ? Number(object.plate_location) : 0,
      distance_from_well_bottom: isSet(object.distance_from_well_bottom)
        ? Number(object.distance_from_well_bottom)
        : undefined,
      retract_distance_per_microliter: isSet(object.retract_distance_per_microliter)
        ? Number(object.retract_distance_per_microliter)
        : undefined,
    };
  },

  toJSON(message: Command_Dispense): unknown {
    const obj: any = {};
    message.volume !== undefined && (obj.volume = message.volume);
    message.empty_tips !== undefined && (obj.empty_tips = message.empty_tips);
    message.blow_out_volume !== undefined && (obj.blow_out_volume = message.blow_out_volume);
    message.plate_location !== undefined && (obj.plate_location = Math.round(message.plate_location));
    message.distance_from_well_bottom !== undefined &&
      (obj.distance_from_well_bottom = message.distance_from_well_bottom);
    message.retract_distance_per_microliter !== undefined &&
      (obj.retract_distance_per_microliter = message.retract_distance_per_microliter);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Dispense>, I>>(base?: I): Command_Dispense {
    return Command_Dispense.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Dispense>, I>>(object: I): Command_Dispense {
    const message = createBaseCommand_Dispense();
    message.volume = object.volume ?? 0;
    message.empty_tips = object.empty_tips ?? false;
    message.blow_out_volume = object.blow_out_volume ?? 0;
    message.plate_location = object.plate_location ?? 0;
    message.distance_from_well_bottom = object.distance_from_well_bottom ?? undefined;
    message.retract_distance_per_microliter = object.retract_distance_per_microliter ?? undefined;
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
  return { plate_location: 0, only_z: undefined };
}

export const Command_MoveToLocation = {
  encode(message: Command_MoveToLocation, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plate_location !== 0) {
      writer.uint32(8).int32(message.plate_location);
    }
    if (message.only_z !== undefined) {
      writer.uint32(16).bool(message.only_z);
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
        case 2:
          if (tag !== 16) {
            break;
          }

          message.only_z = reader.bool();
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
    return {
      plate_location: isSet(object.plate_location) ? Number(object.plate_location) : 0,
      only_z: isSet(object.only_z) ? Boolean(object.only_z) : undefined,
    };
  },

  toJSON(message: Command_MoveToLocation): unknown {
    const obj: any = {};
    message.plate_location !== undefined && (obj.plate_location = Math.round(message.plate_location));
    message.only_z !== undefined && (obj.only_z = message.only_z);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_MoveToLocation>, I>>(base?: I): Command_MoveToLocation {
    return Command_MoveToLocation.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_MoveToLocation>, I>>(object: I): Command_MoveToLocation {
    const message = createBaseCommand_MoveToLocation();
    message.plate_location = object.plate_location ?? 0;
    message.only_z = object.only_z ?? undefined;
    return message;
  },
};

function createBaseCommand_SetLabwareAtLocation(): Command_SetLabwareAtLocation {
  return { plate_location: 0, labware_type: "" };
}

export const Command_SetLabwareAtLocation = {
  encode(message: Command_SetLabwareAtLocation, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plate_location !== 0) {
      writer.uint32(8).int32(message.plate_location);
    }
    if (message.labware_type !== "") {
      writer.uint32(18).string(message.labware_type);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SetLabwareAtLocation {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SetLabwareAtLocation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.plate_location = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.labware_type = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_SetLabwareAtLocation {
    return {
      plate_location: isSet(object.plate_location) ? Number(object.plate_location) : 0,
      labware_type: isSet(object.labware_type) ? String(object.labware_type) : "",
    };
  },

  toJSON(message: Command_SetLabwareAtLocation): unknown {
    const obj: any = {};
    message.plate_location !== undefined && (obj.plate_location = Math.round(message.plate_location));
    message.labware_type !== undefined && (obj.labware_type = message.labware_type);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SetLabwareAtLocation>, I>>(base?: I): Command_SetLabwareAtLocation {
    return Command_SetLabwareAtLocation.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SetLabwareAtLocation>, I>>(object: I): Command_SetLabwareAtLocation {
    const message = createBaseCommand_SetLabwareAtLocation();
    message.plate_location = object.plate_location ?? 0;
    message.labware_type = object.labware_type ?? "";
    return message;
  },
};

function createBaseCommand_SetLiquidClass(): Command_SetLiquidClass {
  return { liquid_class: "" };
}

export const Command_SetLiquidClass = {
  encode(message: Command_SetLiquidClass, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.liquid_class !== "") {
      writer.uint32(10).string(message.liquid_class);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SetLiquidClass {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SetLiquidClass();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.liquid_class = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_SetLiquidClass {
    return { liquid_class: isSet(object.liquid_class) ? String(object.liquid_class) : "" };
  },

  toJSON(message: Command_SetLiquidClass): unknown {
    const obj: any = {};
    message.liquid_class !== undefined && (obj.liquid_class = message.liquid_class);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SetLiquidClass>, I>>(base?: I): Command_SetLiquidClass {
    return Command_SetLiquidClass.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SetLiquidClass>, I>>(object: I): Command_SetLiquidClass {
    const message = createBaseCommand_SetLiquidClass();
    message.liquid_class = object.liquid_class ?? "";
    return message;
  },
};

function createBaseCommand_PickAndPlace(): Command_PickAndPlace {
  return { source_location: 0, dest_location: 0, gripper_offset: 0, labware_thickness: 0 };
}

export const Command_PickAndPlace = {
  encode(message: Command_PickAndPlace, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.source_location !== 0) {
      writer.uint32(8).int32(message.source_location);
    }
    if (message.dest_location !== 0) {
      writer.uint32(16).int32(message.dest_location);
    }
    if (message.gripper_offset !== 0) {
      writer.uint32(29).float(message.gripper_offset);
    }
    if (message.labware_thickness !== 0) {
      writer.uint32(37).float(message.labware_thickness);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_PickAndPlace {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_PickAndPlace();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.source_location = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.dest_location = reader.int32();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.gripper_offset = reader.float();
          continue;
        case 4:
          if (tag !== 37) {
            break;
          }

          message.labware_thickness = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_PickAndPlace {
    return {
      source_location: isSet(object.source_location) ? Number(object.source_location) : 0,
      dest_location: isSet(object.dest_location) ? Number(object.dest_location) : 0,
      gripper_offset: isSet(object.gripper_offset) ? Number(object.gripper_offset) : 0,
      labware_thickness: isSet(object.labware_thickness) ? Number(object.labware_thickness) : 0,
    };
  },

  toJSON(message: Command_PickAndPlace): unknown {
    const obj: any = {};
    message.source_location !== undefined && (obj.source_location = Math.round(message.source_location));
    message.dest_location !== undefined && (obj.dest_location = Math.round(message.dest_location));
    message.gripper_offset !== undefined && (obj.gripper_offset = message.gripper_offset);
    message.labware_thickness !== undefined && (obj.labware_thickness = message.labware_thickness);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_PickAndPlace>, I>>(base?: I): Command_PickAndPlace {
    return Command_PickAndPlace.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_PickAndPlace>, I>>(object: I): Command_PickAndPlace {
    const message = createBaseCommand_PickAndPlace();
    message.source_location = object.source_location ?? 0;
    message.dest_location = object.dest_location ?? 0;
    message.gripper_offset = object.gripper_offset ?? 0;
    message.labware_thickness = object.labware_thickness ?? 0;
    return message;
  },
};

function createBaseCommand_GetDeviceConfiguration(): Command_GetDeviceConfiguration {
  return {};
}

export const Command_GetDeviceConfiguration = {
  encode(_: Command_GetDeviceConfiguration, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetDeviceConfiguration {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetDeviceConfiguration();
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

  fromJSON(_: any): Command_GetDeviceConfiguration {
    return {};
  },

  toJSON(_: Command_GetDeviceConfiguration): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetDeviceConfiguration>, I>>(base?: I): Command_GetDeviceConfiguration {
    return Command_GetDeviceConfiguration.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetDeviceConfiguration>, I>>(_: I): Command_GetDeviceConfiguration {
    const message = createBaseCommand_GetDeviceConfiguration();
    return message;
  },
};

function createBaseCommand_GetFirmwareVersion(): Command_GetFirmwareVersion {
  return {};
}

export const Command_GetFirmwareVersion = {
  encode(_: Command_GetFirmwareVersion, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetFirmwareVersion {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetFirmwareVersion();
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

  fromJSON(_: any): Command_GetFirmwareVersion {
    return {};
  },

  toJSON(_: Command_GetFirmwareVersion): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetFirmwareVersion>, I>>(base?: I): Command_GetFirmwareVersion {
    return Command_GetFirmwareVersion.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetFirmwareVersion>, I>>(_: I): Command_GetFirmwareVersion {
    const message = createBaseCommand_GetFirmwareVersion();
    return message;
  },
};

function createBaseCommand_EnumerateProfiles(): Command_EnumerateProfiles {
  return {};
}

export const Command_EnumerateProfiles = {
  encode(_: Command_EnumerateProfiles, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_EnumerateProfiles {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_EnumerateProfiles();
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

  fromJSON(_: any): Command_EnumerateProfiles {
    return {};
  },

  toJSON(_: Command_EnumerateProfiles): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_EnumerateProfiles>, I>>(base?: I): Command_EnumerateProfiles {
    return Command_EnumerateProfiles.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_EnumerateProfiles>, I>>(_: I): Command_EnumerateProfiles {
    const message = createBaseCommand_EnumerateProfiles();
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
