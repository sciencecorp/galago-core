/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.benchcel";

export interface Command {
  pick_and_place?: Command_PickAndPlace | undefined;
  delid?: Command_Delid | undefined;
  relid?: Command_Relid | undefined;
  load_stack?: Command_LoadStack | undefined;
  release_stack?: Command_ReleaseStack | undefined;
  open_clamp?: Command_OpenClamp | undefined;
  is_stack_loaded?: Command_IsStackLoaded | undefined;
  is_plate_present?: Command_IsPlatePresent | undefined;
  set_labware?: Command_SetLabware | undefined;
  get_stack_count?: Command_GetStackCount | undefined;
  get_teachpoint_names?: Command_GetTeachpointNames | undefined;
  get_labware_names?: Command_GetLabwareNames | undefined;
  protocol_start?: Command_ProtocolStart | undefined;
  protocol_finish?: Command_ProtocolFinish | undefined;
  move_to_home_position?: Command_MoveToHomePosition | undefined;
  pause?: Command_Pause | undefined;
  unpause?: Command_Unpause | undefined;
  show_diagnostics?: Command_ShowDiagsDialog | undefined;
  show_labware_editor?: Command_ShowLabwareEditor | undefined;
}

export interface Command_PickAndPlace {
  pick_from: string;
  place_to: string;
  lidded: boolean;
  retraction_code: number;
}

export interface Command_Delid {
  delid_from: string;
  delid_to: string;
  retraction_code: number;
}

export interface Command_Relid {
  relid_from: string;
  relid_to: string;
  retraction_code: number;
}

export interface Command_LoadStack {
  stack: number;
}

export interface Command_ReleaseStack {
  stack: number;
}

export interface Command_OpenClamp {
  stack: number;
}

export interface Command_IsStackLoaded {
  stack: number;
}

export interface Command_IsPlatePresent {
  stack: number;
}

export interface Command_SetLabware {
  labware: string;
}

export interface Command_GetStackCount {
}

export interface Command_GetTeachpointNames {
}

export interface Command_GetLabwareNames {
}

export interface Command_ProtocolStart {
}

export interface Command_ProtocolFinish {
}

export interface Command_MoveToHomePosition {
}

export interface Command_Pause {
}

export interface Command_Unpause {
}

export interface Command_ShowDiagsDialog {
}

export interface Command_ShowLabwareEditor {
  modal: boolean;
  labware: string;
}

export interface Config {
  profile: string;
}

function createBaseCommand(): Command {
  return {
    pick_and_place: undefined,
    delid: undefined,
    relid: undefined,
    load_stack: undefined,
    release_stack: undefined,
    open_clamp: undefined,
    is_stack_loaded: undefined,
    is_plate_present: undefined,
    set_labware: undefined,
    get_stack_count: undefined,
    get_teachpoint_names: undefined,
    get_labware_names: undefined,
    protocol_start: undefined,
    protocol_finish: undefined,
    move_to_home_position: undefined,
    pause: undefined,
    unpause: undefined,
    show_diagnostics: undefined,
    show_labware_editor: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.pick_and_place !== undefined) {
      Command_PickAndPlace.encode(message.pick_and_place, writer.uint32(10).fork()).ldelim();
    }
    if (message.delid !== undefined) {
      Command_Delid.encode(message.delid, writer.uint32(18).fork()).ldelim();
    }
    if (message.relid !== undefined) {
      Command_Relid.encode(message.relid, writer.uint32(26).fork()).ldelim();
    }
    if (message.load_stack !== undefined) {
      Command_LoadStack.encode(message.load_stack, writer.uint32(34).fork()).ldelim();
    }
    if (message.release_stack !== undefined) {
      Command_ReleaseStack.encode(message.release_stack, writer.uint32(42).fork()).ldelim();
    }
    if (message.open_clamp !== undefined) {
      Command_OpenClamp.encode(message.open_clamp, writer.uint32(50).fork()).ldelim();
    }
    if (message.is_stack_loaded !== undefined) {
      Command_IsStackLoaded.encode(message.is_stack_loaded, writer.uint32(58).fork()).ldelim();
    }
    if (message.is_plate_present !== undefined) {
      Command_IsPlatePresent.encode(message.is_plate_present, writer.uint32(66).fork()).ldelim();
    }
    if (message.set_labware !== undefined) {
      Command_SetLabware.encode(message.set_labware, writer.uint32(74).fork()).ldelim();
    }
    if (message.get_stack_count !== undefined) {
      Command_GetStackCount.encode(message.get_stack_count, writer.uint32(82).fork()).ldelim();
    }
    if (message.get_teachpoint_names !== undefined) {
      Command_GetTeachpointNames.encode(message.get_teachpoint_names, writer.uint32(90).fork()).ldelim();
    }
    if (message.get_labware_names !== undefined) {
      Command_GetLabwareNames.encode(message.get_labware_names, writer.uint32(98).fork()).ldelim();
    }
    if (message.protocol_start !== undefined) {
      Command_ProtocolStart.encode(message.protocol_start, writer.uint32(106).fork()).ldelim();
    }
    if (message.protocol_finish !== undefined) {
      Command_ProtocolFinish.encode(message.protocol_finish, writer.uint32(114).fork()).ldelim();
    }
    if (message.move_to_home_position !== undefined) {
      Command_MoveToHomePosition.encode(message.move_to_home_position, writer.uint32(122).fork()).ldelim();
    }
    if (message.pause !== undefined) {
      Command_Pause.encode(message.pause, writer.uint32(130).fork()).ldelim();
    }
    if (message.unpause !== undefined) {
      Command_Unpause.encode(message.unpause, writer.uint32(138).fork()).ldelim();
    }
    if (message.show_diagnostics !== undefined) {
      Command_ShowDiagsDialog.encode(message.show_diagnostics, writer.uint32(146).fork()).ldelim();
    }
    if (message.show_labware_editor !== undefined) {
      Command_ShowLabwareEditor.encode(message.show_labware_editor, writer.uint32(154).fork()).ldelim();
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

          message.pick_and_place = Command_PickAndPlace.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.delid = Command_Delid.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.relid = Command_Relid.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.load_stack = Command_LoadStack.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.release_stack = Command_ReleaseStack.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.open_clamp = Command_OpenClamp.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.is_stack_loaded = Command_IsStackLoaded.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.is_plate_present = Command_IsPlatePresent.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.set_labware = Command_SetLabware.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.get_stack_count = Command_GetStackCount.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.get_teachpoint_names = Command_GetTeachpointNames.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.get_labware_names = Command_GetLabwareNames.decode(reader, reader.uint32());
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.protocol_start = Command_ProtocolStart.decode(reader, reader.uint32());
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.protocol_finish = Command_ProtocolFinish.decode(reader, reader.uint32());
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.move_to_home_position = Command_MoveToHomePosition.decode(reader, reader.uint32());
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.pause = Command_Pause.decode(reader, reader.uint32());
          continue;
        case 17:
          if (tag !== 138) {
            break;
          }

          message.unpause = Command_Unpause.decode(reader, reader.uint32());
          continue;
        case 18:
          if (tag !== 146) {
            break;
          }

          message.show_diagnostics = Command_ShowDiagsDialog.decode(reader, reader.uint32());
          continue;
        case 19:
          if (tag !== 154) {
            break;
          }

          message.show_labware_editor = Command_ShowLabwareEditor.decode(reader, reader.uint32());
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
      pick_and_place: isSet(object.pick_and_place) ? Command_PickAndPlace.fromJSON(object.pick_and_place) : undefined,
      delid: isSet(object.delid) ? Command_Delid.fromJSON(object.delid) : undefined,
      relid: isSet(object.relid) ? Command_Relid.fromJSON(object.relid) : undefined,
      load_stack: isSet(object.load_stack) ? Command_LoadStack.fromJSON(object.load_stack) : undefined,
      release_stack: isSet(object.release_stack) ? Command_ReleaseStack.fromJSON(object.release_stack) : undefined,
      open_clamp: isSet(object.open_clamp) ? Command_OpenClamp.fromJSON(object.open_clamp) : undefined,
      is_stack_loaded: isSet(object.is_stack_loaded)
        ? Command_IsStackLoaded.fromJSON(object.is_stack_loaded)
        : undefined,
      is_plate_present: isSet(object.is_plate_present)
        ? Command_IsPlatePresent.fromJSON(object.is_plate_present)
        : undefined,
      set_labware: isSet(object.set_labware) ? Command_SetLabware.fromJSON(object.set_labware) : undefined,
      get_stack_count: isSet(object.get_stack_count)
        ? Command_GetStackCount.fromJSON(object.get_stack_count)
        : undefined,
      get_teachpoint_names: isSet(object.get_teachpoint_names)
        ? Command_GetTeachpointNames.fromJSON(object.get_teachpoint_names)
        : undefined,
      get_labware_names: isSet(object.get_labware_names)
        ? Command_GetLabwareNames.fromJSON(object.get_labware_names)
        : undefined,
      protocol_start: isSet(object.protocol_start) ? Command_ProtocolStart.fromJSON(object.protocol_start) : undefined,
      protocol_finish: isSet(object.protocol_finish)
        ? Command_ProtocolFinish.fromJSON(object.protocol_finish)
        : undefined,
      move_to_home_position: isSet(object.move_to_home_position)
        ? Command_MoveToHomePosition.fromJSON(object.move_to_home_position)
        : undefined,
      pause: isSet(object.pause) ? Command_Pause.fromJSON(object.pause) : undefined,
      unpause: isSet(object.unpause) ? Command_Unpause.fromJSON(object.unpause) : undefined,
      show_diagnostics: isSet(object.show_diagnostics)
        ? Command_ShowDiagsDialog.fromJSON(object.show_diagnostics)
        : undefined,
      show_labware_editor: isSet(object.show_labware_editor)
        ? Command_ShowLabwareEditor.fromJSON(object.show_labware_editor)
        : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.pick_and_place !== undefined &&
      (obj.pick_and_place = message.pick_and_place ? Command_PickAndPlace.toJSON(message.pick_and_place) : undefined);
    message.delid !== undefined && (obj.delid = message.delid ? Command_Delid.toJSON(message.delid) : undefined);
    message.relid !== undefined && (obj.relid = message.relid ? Command_Relid.toJSON(message.relid) : undefined);
    message.load_stack !== undefined &&
      (obj.load_stack = message.load_stack ? Command_LoadStack.toJSON(message.load_stack) : undefined);
    message.release_stack !== undefined &&
      (obj.release_stack = message.release_stack ? Command_ReleaseStack.toJSON(message.release_stack) : undefined);
    message.open_clamp !== undefined &&
      (obj.open_clamp = message.open_clamp ? Command_OpenClamp.toJSON(message.open_clamp) : undefined);
    message.is_stack_loaded !== undefined &&
      (obj.is_stack_loaded = message.is_stack_loaded
        ? Command_IsStackLoaded.toJSON(message.is_stack_loaded)
        : undefined);
    message.is_plate_present !== undefined && (obj.is_plate_present = message.is_plate_present
      ? Command_IsPlatePresent.toJSON(message.is_plate_present)
      : undefined);
    message.set_labware !== undefined &&
      (obj.set_labware = message.set_labware ? Command_SetLabware.toJSON(message.set_labware) : undefined);
    message.get_stack_count !== undefined &&
      (obj.get_stack_count = message.get_stack_count
        ? Command_GetStackCount.toJSON(message.get_stack_count)
        : undefined);
    message.get_teachpoint_names !== undefined && (obj.get_teachpoint_names = message.get_teachpoint_names
      ? Command_GetTeachpointNames.toJSON(message.get_teachpoint_names)
      : undefined);
    message.get_labware_names !== undefined && (obj.get_labware_names = message.get_labware_names
      ? Command_GetLabwareNames.toJSON(message.get_labware_names)
      : undefined);
    message.protocol_start !== undefined &&
      (obj.protocol_start = message.protocol_start ? Command_ProtocolStart.toJSON(message.protocol_start) : undefined);
    message.protocol_finish !== undefined && (obj.protocol_finish = message.protocol_finish
      ? Command_ProtocolFinish.toJSON(message.protocol_finish)
      : undefined);
    message.move_to_home_position !== undefined && (obj.move_to_home_position = message.move_to_home_position
      ? Command_MoveToHomePosition.toJSON(message.move_to_home_position)
      : undefined);
    message.pause !== undefined && (obj.pause = message.pause ? Command_Pause.toJSON(message.pause) : undefined);
    message.unpause !== undefined &&
      (obj.unpause = message.unpause ? Command_Unpause.toJSON(message.unpause) : undefined);
    message.show_diagnostics !== undefined && (obj.show_diagnostics = message.show_diagnostics
      ? Command_ShowDiagsDialog.toJSON(message.show_diagnostics)
      : undefined);
    message.show_labware_editor !== undefined && (obj.show_labware_editor = message.show_labware_editor
      ? Command_ShowLabwareEditor.toJSON(message.show_labware_editor)
      : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.pick_and_place = (object.pick_and_place !== undefined && object.pick_and_place !== null)
      ? Command_PickAndPlace.fromPartial(object.pick_and_place)
      : undefined;
    message.delid = (object.delid !== undefined && object.delid !== null)
      ? Command_Delid.fromPartial(object.delid)
      : undefined;
    message.relid = (object.relid !== undefined && object.relid !== null)
      ? Command_Relid.fromPartial(object.relid)
      : undefined;
    message.load_stack = (object.load_stack !== undefined && object.load_stack !== null)
      ? Command_LoadStack.fromPartial(object.load_stack)
      : undefined;
    message.release_stack = (object.release_stack !== undefined && object.release_stack !== null)
      ? Command_ReleaseStack.fromPartial(object.release_stack)
      : undefined;
    message.open_clamp = (object.open_clamp !== undefined && object.open_clamp !== null)
      ? Command_OpenClamp.fromPartial(object.open_clamp)
      : undefined;
    message.is_stack_loaded = (object.is_stack_loaded !== undefined && object.is_stack_loaded !== null)
      ? Command_IsStackLoaded.fromPartial(object.is_stack_loaded)
      : undefined;
    message.is_plate_present = (object.is_plate_present !== undefined && object.is_plate_present !== null)
      ? Command_IsPlatePresent.fromPartial(object.is_plate_present)
      : undefined;
    message.set_labware = (object.set_labware !== undefined && object.set_labware !== null)
      ? Command_SetLabware.fromPartial(object.set_labware)
      : undefined;
    message.get_stack_count = (object.get_stack_count !== undefined && object.get_stack_count !== null)
      ? Command_GetStackCount.fromPartial(object.get_stack_count)
      : undefined;
    message.get_teachpoint_names = (object.get_teachpoint_names !== undefined && object.get_teachpoint_names !== null)
      ? Command_GetTeachpointNames.fromPartial(object.get_teachpoint_names)
      : undefined;
    message.get_labware_names = (object.get_labware_names !== undefined && object.get_labware_names !== null)
      ? Command_GetLabwareNames.fromPartial(object.get_labware_names)
      : undefined;
    message.protocol_start = (object.protocol_start !== undefined && object.protocol_start !== null)
      ? Command_ProtocolStart.fromPartial(object.protocol_start)
      : undefined;
    message.protocol_finish = (object.protocol_finish !== undefined && object.protocol_finish !== null)
      ? Command_ProtocolFinish.fromPartial(object.protocol_finish)
      : undefined;
    message.move_to_home_position =
      (object.move_to_home_position !== undefined && object.move_to_home_position !== null)
        ? Command_MoveToHomePosition.fromPartial(object.move_to_home_position)
        : undefined;
    message.pause = (object.pause !== undefined && object.pause !== null)
      ? Command_Pause.fromPartial(object.pause)
      : undefined;
    message.unpause = (object.unpause !== undefined && object.unpause !== null)
      ? Command_Unpause.fromPartial(object.unpause)
      : undefined;
    message.show_diagnostics = (object.show_diagnostics !== undefined && object.show_diagnostics !== null)
      ? Command_ShowDiagsDialog.fromPartial(object.show_diagnostics)
      : undefined;
    message.show_labware_editor = (object.show_labware_editor !== undefined && object.show_labware_editor !== null)
      ? Command_ShowLabwareEditor.fromPartial(object.show_labware_editor)
      : undefined;
    return message;
  },
};

function createBaseCommand_PickAndPlace(): Command_PickAndPlace {
  return { pick_from: "", place_to: "", lidded: false, retraction_code: 0 };
}

export const Command_PickAndPlace = {
  encode(message: Command_PickAndPlace, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.pick_from !== "") {
      writer.uint32(10).string(message.pick_from);
    }
    if (message.place_to !== "") {
      writer.uint32(18).string(message.place_to);
    }
    if (message.lidded === true) {
      writer.uint32(24).bool(message.lidded);
    }
    if (message.retraction_code !== 0) {
      writer.uint32(32).int32(message.retraction_code);
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
          if (tag !== 10) {
            break;
          }

          message.pick_from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.place_to = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.lidded = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.retraction_code = reader.int32();
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
      pick_from: isSet(object.pick_from) ? String(object.pick_from) : "",
      place_to: isSet(object.place_to) ? String(object.place_to) : "",
      lidded: isSet(object.lidded) ? Boolean(object.lidded) : false,
      retraction_code: isSet(object.retraction_code) ? Number(object.retraction_code) : 0,
    };
  },

  toJSON(message: Command_PickAndPlace): unknown {
    const obj: any = {};
    message.pick_from !== undefined && (obj.pick_from = message.pick_from);
    message.place_to !== undefined && (obj.place_to = message.place_to);
    message.lidded !== undefined && (obj.lidded = message.lidded);
    message.retraction_code !== undefined && (obj.retraction_code = Math.round(message.retraction_code));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_PickAndPlace>, I>>(base?: I): Command_PickAndPlace {
    return Command_PickAndPlace.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_PickAndPlace>, I>>(object: I): Command_PickAndPlace {
    const message = createBaseCommand_PickAndPlace();
    message.pick_from = object.pick_from ?? "";
    message.place_to = object.place_to ?? "";
    message.lidded = object.lidded ?? false;
    message.retraction_code = object.retraction_code ?? 0;
    return message;
  },
};

function createBaseCommand_Delid(): Command_Delid {
  return { delid_from: "", delid_to: "", retraction_code: 0 };
}

export const Command_Delid = {
  encode(message: Command_Delid, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.delid_from !== "") {
      writer.uint32(10).string(message.delid_from);
    }
    if (message.delid_to !== "") {
      writer.uint32(18).string(message.delid_to);
    }
    if (message.retraction_code !== 0) {
      writer.uint32(24).int32(message.retraction_code);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Delid {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Delid();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.delid_from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.delid_to = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.retraction_code = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Delid {
    return {
      delid_from: isSet(object.delid_from) ? String(object.delid_from) : "",
      delid_to: isSet(object.delid_to) ? String(object.delid_to) : "",
      retraction_code: isSet(object.retraction_code) ? Number(object.retraction_code) : 0,
    };
  },

  toJSON(message: Command_Delid): unknown {
    const obj: any = {};
    message.delid_from !== undefined && (obj.delid_from = message.delid_from);
    message.delid_to !== undefined && (obj.delid_to = message.delid_to);
    message.retraction_code !== undefined && (obj.retraction_code = Math.round(message.retraction_code));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Delid>, I>>(base?: I): Command_Delid {
    return Command_Delid.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Delid>, I>>(object: I): Command_Delid {
    const message = createBaseCommand_Delid();
    message.delid_from = object.delid_from ?? "";
    message.delid_to = object.delid_to ?? "";
    message.retraction_code = object.retraction_code ?? 0;
    return message;
  },
};

function createBaseCommand_Relid(): Command_Relid {
  return { relid_from: "", relid_to: "", retraction_code: 0 };
}

export const Command_Relid = {
  encode(message: Command_Relid, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.relid_from !== "") {
      writer.uint32(10).string(message.relid_from);
    }
    if (message.relid_to !== "") {
      writer.uint32(18).string(message.relid_to);
    }
    if (message.retraction_code !== 0) {
      writer.uint32(24).int32(message.retraction_code);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Relid {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Relid();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.relid_from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.relid_to = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.retraction_code = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_Relid {
    return {
      relid_from: isSet(object.relid_from) ? String(object.relid_from) : "",
      relid_to: isSet(object.relid_to) ? String(object.relid_to) : "",
      retraction_code: isSet(object.retraction_code) ? Number(object.retraction_code) : 0,
    };
  },

  toJSON(message: Command_Relid): unknown {
    const obj: any = {};
    message.relid_from !== undefined && (obj.relid_from = message.relid_from);
    message.relid_to !== undefined && (obj.relid_to = message.relid_to);
    message.retraction_code !== undefined && (obj.retraction_code = Math.round(message.retraction_code));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Relid>, I>>(base?: I): Command_Relid {
    return Command_Relid.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Relid>, I>>(object: I): Command_Relid {
    const message = createBaseCommand_Relid();
    message.relid_from = object.relid_from ?? "";
    message.relid_to = object.relid_to ?? "";
    message.retraction_code = object.retraction_code ?? 0;
    return message;
  },
};

function createBaseCommand_LoadStack(): Command_LoadStack {
  return { stack: 0 };
}

export const Command_LoadStack = {
  encode(message: Command_LoadStack, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.stack !== 0) {
      writer.uint32(8).int32(message.stack);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_LoadStack {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_LoadStack();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.stack = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_LoadStack {
    return { stack: isSet(object.stack) ? Number(object.stack) : 0 };
  },

  toJSON(message: Command_LoadStack): unknown {
    const obj: any = {};
    message.stack !== undefined && (obj.stack = Math.round(message.stack));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_LoadStack>, I>>(base?: I): Command_LoadStack {
    return Command_LoadStack.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_LoadStack>, I>>(object: I): Command_LoadStack {
    const message = createBaseCommand_LoadStack();
    message.stack = object.stack ?? 0;
    return message;
  },
};

function createBaseCommand_ReleaseStack(): Command_ReleaseStack {
  return { stack: 0 };
}

export const Command_ReleaseStack = {
  encode(message: Command_ReleaseStack, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.stack !== 0) {
      writer.uint32(8).int32(message.stack);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_ReleaseStack {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_ReleaseStack();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.stack = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_ReleaseStack {
    return { stack: isSet(object.stack) ? Number(object.stack) : 0 };
  },

  toJSON(message: Command_ReleaseStack): unknown {
    const obj: any = {};
    message.stack !== undefined && (obj.stack = Math.round(message.stack));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_ReleaseStack>, I>>(base?: I): Command_ReleaseStack {
    return Command_ReleaseStack.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ReleaseStack>, I>>(object: I): Command_ReleaseStack {
    const message = createBaseCommand_ReleaseStack();
    message.stack = object.stack ?? 0;
    return message;
  },
};

function createBaseCommand_OpenClamp(): Command_OpenClamp {
  return { stack: 0 };
}

export const Command_OpenClamp = {
  encode(message: Command_OpenClamp, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.stack !== 0) {
      writer.uint32(8).int32(message.stack);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_OpenClamp {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_OpenClamp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.stack = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_OpenClamp {
    return { stack: isSet(object.stack) ? Number(object.stack) : 0 };
  },

  toJSON(message: Command_OpenClamp): unknown {
    const obj: any = {};
    message.stack !== undefined && (obj.stack = Math.round(message.stack));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_OpenClamp>, I>>(base?: I): Command_OpenClamp {
    return Command_OpenClamp.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_OpenClamp>, I>>(object: I): Command_OpenClamp {
    const message = createBaseCommand_OpenClamp();
    message.stack = object.stack ?? 0;
    return message;
  },
};

function createBaseCommand_IsStackLoaded(): Command_IsStackLoaded {
  return { stack: 0 };
}

export const Command_IsStackLoaded = {
  encode(message: Command_IsStackLoaded, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.stack !== 0) {
      writer.uint32(8).int32(message.stack);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_IsStackLoaded {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_IsStackLoaded();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.stack = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_IsStackLoaded {
    return { stack: isSet(object.stack) ? Number(object.stack) : 0 };
  },

  toJSON(message: Command_IsStackLoaded): unknown {
    const obj: any = {};
    message.stack !== undefined && (obj.stack = Math.round(message.stack));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_IsStackLoaded>, I>>(base?: I): Command_IsStackLoaded {
    return Command_IsStackLoaded.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_IsStackLoaded>, I>>(object: I): Command_IsStackLoaded {
    const message = createBaseCommand_IsStackLoaded();
    message.stack = object.stack ?? 0;
    return message;
  },
};

function createBaseCommand_IsPlatePresent(): Command_IsPlatePresent {
  return { stack: 0 };
}

export const Command_IsPlatePresent = {
  encode(message: Command_IsPlatePresent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.stack !== 0) {
      writer.uint32(8).int32(message.stack);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_IsPlatePresent {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_IsPlatePresent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.stack = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_IsPlatePresent {
    return { stack: isSet(object.stack) ? Number(object.stack) : 0 };
  },

  toJSON(message: Command_IsPlatePresent): unknown {
    const obj: any = {};
    message.stack !== undefined && (obj.stack = Math.round(message.stack));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_IsPlatePresent>, I>>(base?: I): Command_IsPlatePresent {
    return Command_IsPlatePresent.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_IsPlatePresent>, I>>(object: I): Command_IsPlatePresent {
    const message = createBaseCommand_IsPlatePresent();
    message.stack = object.stack ?? 0;
    return message;
  },
};

function createBaseCommand_SetLabware(): Command_SetLabware {
  return { labware: "" };
}

export const Command_SetLabware = {
  encode(message: Command_SetLabware, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.labware !== "") {
      writer.uint32(10).string(message.labware);
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
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_SetLabware {
    return { labware: isSet(object.labware) ? String(object.labware) : "" };
  },

  toJSON(message: Command_SetLabware): unknown {
    const obj: any = {};
    message.labware !== undefined && (obj.labware = message.labware);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SetLabware>, I>>(base?: I): Command_SetLabware {
    return Command_SetLabware.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SetLabware>, I>>(object: I): Command_SetLabware {
    const message = createBaseCommand_SetLabware();
    message.labware = object.labware ?? "";
    return message;
  },
};

function createBaseCommand_GetStackCount(): Command_GetStackCount {
  return {};
}

export const Command_GetStackCount = {
  encode(_: Command_GetStackCount, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetStackCount {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetStackCount();
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

  fromJSON(_: any): Command_GetStackCount {
    return {};
  },

  toJSON(_: Command_GetStackCount): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetStackCount>, I>>(base?: I): Command_GetStackCount {
    return Command_GetStackCount.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetStackCount>, I>>(_: I): Command_GetStackCount {
    const message = createBaseCommand_GetStackCount();
    return message;
  },
};

function createBaseCommand_GetTeachpointNames(): Command_GetTeachpointNames {
  return {};
}

export const Command_GetTeachpointNames = {
  encode(_: Command_GetTeachpointNames, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetTeachpointNames {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetTeachpointNames();
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

  fromJSON(_: any): Command_GetTeachpointNames {
    return {};
  },

  toJSON(_: Command_GetTeachpointNames): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetTeachpointNames>, I>>(base?: I): Command_GetTeachpointNames {
    return Command_GetTeachpointNames.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetTeachpointNames>, I>>(_: I): Command_GetTeachpointNames {
    const message = createBaseCommand_GetTeachpointNames();
    return message;
  },
};

function createBaseCommand_GetLabwareNames(): Command_GetLabwareNames {
  return {};
}

export const Command_GetLabwareNames = {
  encode(_: Command_GetLabwareNames, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_GetLabwareNames {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_GetLabwareNames();
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

  fromJSON(_: any): Command_GetLabwareNames {
    return {};
  },

  toJSON(_: Command_GetLabwareNames): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_GetLabwareNames>, I>>(base?: I): Command_GetLabwareNames {
    return Command_GetLabwareNames.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_GetLabwareNames>, I>>(_: I): Command_GetLabwareNames {
    const message = createBaseCommand_GetLabwareNames();
    return message;
  },
};

function createBaseCommand_ProtocolStart(): Command_ProtocolStart {
  return {};
}

export const Command_ProtocolStart = {
  encode(_: Command_ProtocolStart, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_ProtocolStart {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_ProtocolStart();
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

  fromJSON(_: any): Command_ProtocolStart {
    return {};
  },

  toJSON(_: Command_ProtocolStart): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_ProtocolStart>, I>>(base?: I): Command_ProtocolStart {
    return Command_ProtocolStart.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ProtocolStart>, I>>(_: I): Command_ProtocolStart {
    const message = createBaseCommand_ProtocolStart();
    return message;
  },
};

function createBaseCommand_ProtocolFinish(): Command_ProtocolFinish {
  return {};
}

export const Command_ProtocolFinish = {
  encode(_: Command_ProtocolFinish, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_ProtocolFinish {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_ProtocolFinish();
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

  fromJSON(_: any): Command_ProtocolFinish {
    return {};
  },

  toJSON(_: Command_ProtocolFinish): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_ProtocolFinish>, I>>(base?: I): Command_ProtocolFinish {
    return Command_ProtocolFinish.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ProtocolFinish>, I>>(_: I): Command_ProtocolFinish {
    const message = createBaseCommand_ProtocolFinish();
    return message;
  },
};

function createBaseCommand_MoveToHomePosition(): Command_MoveToHomePosition {
  return {};
}

export const Command_MoveToHomePosition = {
  encode(_: Command_MoveToHomePosition, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_MoveToHomePosition {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_MoveToHomePosition();
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

  fromJSON(_: any): Command_MoveToHomePosition {
    return {};
  },

  toJSON(_: Command_MoveToHomePosition): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_MoveToHomePosition>, I>>(base?: I): Command_MoveToHomePosition {
    return Command_MoveToHomePosition.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_MoveToHomePosition>, I>>(_: I): Command_MoveToHomePosition {
    const message = createBaseCommand_MoveToHomePosition();
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

function createBaseCommand_Unpause(): Command_Unpause {
  return {};
}

export const Command_Unpause = {
  encode(_: Command_Unpause, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Unpause {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Unpause();
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

  fromJSON(_: any): Command_Unpause {
    return {};
  },

  toJSON(_: Command_Unpause): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Unpause>, I>>(base?: I): Command_Unpause {
    return Command_Unpause.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Unpause>, I>>(_: I): Command_Unpause {
    const message = createBaseCommand_Unpause();
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

function createBaseCommand_ShowLabwareEditor(): Command_ShowLabwareEditor {
  return { modal: false, labware: "" };
}

export const Command_ShowLabwareEditor = {
  encode(message: Command_ShowLabwareEditor, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.modal === true) {
      writer.uint32(8).bool(message.modal);
    }
    if (message.labware !== "") {
      writer.uint32(18).string(message.labware);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_ShowLabwareEditor {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_ShowLabwareEditor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.modal = reader.bool();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.labware = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_ShowLabwareEditor {
    return {
      modal: isSet(object.modal) ? Boolean(object.modal) : false,
      labware: isSet(object.labware) ? String(object.labware) : "",
    };
  },

  toJSON(message: Command_ShowLabwareEditor): unknown {
    const obj: any = {};
    message.modal !== undefined && (obj.modal = message.modal);
    message.labware !== undefined && (obj.labware = message.labware);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_ShowLabwareEditor>, I>>(base?: I): Command_ShowLabwareEditor {
    return Command_ShowLabwareEditor.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_ShowLabwareEditor>, I>>(object: I): Command_ShowLabwareEditor {
    const message = createBaseCommand_ShowLabwareEditor();
    message.modal = object.modal ?? false;
    message.labware = object.labware ?? "";
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
