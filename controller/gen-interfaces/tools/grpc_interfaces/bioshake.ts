/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.bioshake";

export interface Command {
  grip?: Command_Grip | undefined;
  ungrip?: Command_Ungrip | undefined;
  home?: Command_Home | undefined;
  start_shake?: Command_StartShake | undefined;
  stop_shake?: Command_StopShake | undefined;
  reset?: Command_Reset | undefined;
  wait_for_shake_to_finish?: Command_WaitForShakeToFinish | undefined;
  set_temperature?: Command_SetTemperature | undefined;
  temperature_on?: Command_TemperatureOn | undefined;
  temperatrue_off?: Command_TemperatureOff | undefined;
}

export interface Command_Grip {
}

export interface Command_Ungrip {
}

export interface Command_Home {
}

export interface Command_StartShake {
  speed: number;
  acceleration: number;
  duration: number;
}

export interface Command_StopShake {
}

export interface Command_Reset {
}

export interface Command_WaitForShakeToFinish {
  timeout: number;
}

export interface Command_TemperatureOn {
}

export interface Command_TemperatureOff {
}

export interface Command_SetTemperature {
  temperature: number;
}

export interface Config {
  com_port: string;
}

function createBaseCommand(): Command {
  return {
    grip: undefined,
    ungrip: undefined,
    home: undefined,
    start_shake: undefined,
    stop_shake: undefined,
    reset: undefined,
    wait_for_shake_to_finish: undefined,
    set_temperature: undefined,
    temperature_on: undefined,
    temperatrue_off: undefined,
  };
}

export const Command = {
  encode(message: Command, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.grip !== undefined) {
      Command_Grip.encode(message.grip, writer.uint32(10).fork()).ldelim();
    }
    if (message.ungrip !== undefined) {
      Command_Ungrip.encode(message.ungrip, writer.uint32(18).fork()).ldelim();
    }
    if (message.home !== undefined) {
      Command_Home.encode(message.home, writer.uint32(26).fork()).ldelim();
    }
    if (message.start_shake !== undefined) {
      Command_StartShake.encode(message.start_shake, writer.uint32(34).fork()).ldelim();
    }
    if (message.stop_shake !== undefined) {
      Command_StopShake.encode(message.stop_shake, writer.uint32(42).fork()).ldelim();
    }
    if (message.reset !== undefined) {
      Command_Reset.encode(message.reset, writer.uint32(50).fork()).ldelim();
    }
    if (message.wait_for_shake_to_finish !== undefined) {
      Command_WaitForShakeToFinish.encode(message.wait_for_shake_to_finish, writer.uint32(58).fork()).ldelim();
    }
    if (message.set_temperature !== undefined) {
      Command_SetTemperature.encode(message.set_temperature, writer.uint32(66).fork()).ldelim();
    }
    if (message.temperature_on !== undefined) {
      Command_TemperatureOn.encode(message.temperature_on, writer.uint32(74).fork()).ldelim();
    }
    if (message.temperatrue_off !== undefined) {
      Command_TemperatureOff.encode(message.temperatrue_off, writer.uint32(82).fork()).ldelim();
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

          message.grip = Command_Grip.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.ungrip = Command_Ungrip.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.home = Command_Home.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.start_shake = Command_StartShake.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.stop_shake = Command_StopShake.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.reset = Command_Reset.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.wait_for_shake_to_finish = Command_WaitForShakeToFinish.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.set_temperature = Command_SetTemperature.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.temperature_on = Command_TemperatureOn.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.temperatrue_off = Command_TemperatureOff.decode(reader, reader.uint32());
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
      grip: isSet(object.grip) ? Command_Grip.fromJSON(object.grip) : undefined,
      ungrip: isSet(object.ungrip) ? Command_Ungrip.fromJSON(object.ungrip) : undefined,
      home: isSet(object.home) ? Command_Home.fromJSON(object.home) : undefined,
      start_shake: isSet(object.start_shake) ? Command_StartShake.fromJSON(object.start_shake) : undefined,
      stop_shake: isSet(object.stop_shake) ? Command_StopShake.fromJSON(object.stop_shake) : undefined,
      reset: isSet(object.reset) ? Command_Reset.fromJSON(object.reset) : undefined,
      wait_for_shake_to_finish: isSet(object.wait_for_shake_to_finish)
        ? Command_WaitForShakeToFinish.fromJSON(object.wait_for_shake_to_finish)
        : undefined,
      set_temperature: isSet(object.set_temperature)
        ? Command_SetTemperature.fromJSON(object.set_temperature)
        : undefined,
      temperature_on: isSet(object.temperature_on) ? Command_TemperatureOn.fromJSON(object.temperature_on) : undefined,
      temperatrue_off: isSet(object.temperatrue_off)
        ? Command_TemperatureOff.fromJSON(object.temperatrue_off)
        : undefined,
    };
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.grip !== undefined && (obj.grip = message.grip ? Command_Grip.toJSON(message.grip) : undefined);
    message.ungrip !== undefined && (obj.ungrip = message.ungrip ? Command_Ungrip.toJSON(message.ungrip) : undefined);
    message.home !== undefined && (obj.home = message.home ? Command_Home.toJSON(message.home) : undefined);
    message.start_shake !== undefined &&
      (obj.start_shake = message.start_shake ? Command_StartShake.toJSON(message.start_shake) : undefined);
    message.stop_shake !== undefined &&
      (obj.stop_shake = message.stop_shake ? Command_StopShake.toJSON(message.stop_shake) : undefined);
    message.reset !== undefined && (obj.reset = message.reset ? Command_Reset.toJSON(message.reset) : undefined);
    message.wait_for_shake_to_finish !== undefined && (obj.wait_for_shake_to_finish = message.wait_for_shake_to_finish
      ? Command_WaitForShakeToFinish.toJSON(message.wait_for_shake_to_finish)
      : undefined);
    message.set_temperature !== undefined && (obj.set_temperature = message.set_temperature
      ? Command_SetTemperature.toJSON(message.set_temperature)
      : undefined);
    message.temperature_on !== undefined &&
      (obj.temperature_on = message.temperature_on ? Command_TemperatureOn.toJSON(message.temperature_on) : undefined);
    message.temperatrue_off !== undefined && (obj.temperatrue_off = message.temperatrue_off
      ? Command_TemperatureOff.toJSON(message.temperatrue_off)
      : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Command>, I>>(base?: I): Command {
    return Command.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command>, I>>(object: I): Command {
    const message = createBaseCommand();
    message.grip = (object.grip !== undefined && object.grip !== null)
      ? Command_Grip.fromPartial(object.grip)
      : undefined;
    message.ungrip = (object.ungrip !== undefined && object.ungrip !== null)
      ? Command_Ungrip.fromPartial(object.ungrip)
      : undefined;
    message.home = (object.home !== undefined && object.home !== null)
      ? Command_Home.fromPartial(object.home)
      : undefined;
    message.start_shake = (object.start_shake !== undefined && object.start_shake !== null)
      ? Command_StartShake.fromPartial(object.start_shake)
      : undefined;
    message.stop_shake = (object.stop_shake !== undefined && object.stop_shake !== null)
      ? Command_StopShake.fromPartial(object.stop_shake)
      : undefined;
    message.reset = (object.reset !== undefined && object.reset !== null)
      ? Command_Reset.fromPartial(object.reset)
      : undefined;
    message.wait_for_shake_to_finish =
      (object.wait_for_shake_to_finish !== undefined && object.wait_for_shake_to_finish !== null)
        ? Command_WaitForShakeToFinish.fromPartial(object.wait_for_shake_to_finish)
        : undefined;
    message.set_temperature = (object.set_temperature !== undefined && object.set_temperature !== null)
      ? Command_SetTemperature.fromPartial(object.set_temperature)
      : undefined;
    message.temperature_on = (object.temperature_on !== undefined && object.temperature_on !== null)
      ? Command_TemperatureOn.fromPartial(object.temperature_on)
      : undefined;
    message.temperatrue_off = (object.temperatrue_off !== undefined && object.temperatrue_off !== null)
      ? Command_TemperatureOff.fromPartial(object.temperatrue_off)
      : undefined;
    return message;
  },
};

function createBaseCommand_Grip(): Command_Grip {
  return {};
}

export const Command_Grip = {
  encode(_: Command_Grip, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Grip {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Grip();
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

  fromJSON(_: any): Command_Grip {
    return {};
  },

  toJSON(_: Command_Grip): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Grip>, I>>(base?: I): Command_Grip {
    return Command_Grip.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Grip>, I>>(_: I): Command_Grip {
    const message = createBaseCommand_Grip();
    return message;
  },
};

function createBaseCommand_Ungrip(): Command_Ungrip {
  return {};
}

export const Command_Ungrip = {
  encode(_: Command_Ungrip, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Ungrip {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Ungrip();
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

  fromJSON(_: any): Command_Ungrip {
    return {};
  },

  toJSON(_: Command_Ungrip): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Ungrip>, I>>(base?: I): Command_Ungrip {
    return Command_Ungrip.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Ungrip>, I>>(_: I): Command_Ungrip {
    const message = createBaseCommand_Ungrip();
    return message;
  },
};

function createBaseCommand_Home(): Command_Home {
  return {};
}

export const Command_Home = {
  encode(_: Command_Home, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Home {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Home();
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

  fromJSON(_: any): Command_Home {
    return {};
  },

  toJSON(_: Command_Home): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Home>, I>>(base?: I): Command_Home {
    return Command_Home.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Home>, I>>(_: I): Command_Home {
    const message = createBaseCommand_Home();
    return message;
  },
};

function createBaseCommand_StartShake(): Command_StartShake {
  return { speed: 0, acceleration: 0, duration: 0 };
}

export const Command_StartShake = {
  encode(message: Command_StartShake, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.speed !== 0) {
      writer.uint32(8).int32(message.speed);
    }
    if (message.acceleration !== 0) {
      writer.uint32(16).int32(message.acceleration);
    }
    if (message.duration !== 0) {
      writer.uint32(24).int32(message.duration);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_StartShake {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_StartShake();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.speed = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.acceleration = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.duration = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_StartShake {
    return {
      speed: isSet(object.speed) ? Number(object.speed) : 0,
      acceleration: isSet(object.acceleration) ? Number(object.acceleration) : 0,
      duration: isSet(object.duration) ? Number(object.duration) : 0,
    };
  },

  toJSON(message: Command_StartShake): unknown {
    const obj: any = {};
    message.speed !== undefined && (obj.speed = Math.round(message.speed));
    message.acceleration !== undefined && (obj.acceleration = Math.round(message.acceleration));
    message.duration !== undefined && (obj.duration = Math.round(message.duration));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_StartShake>, I>>(base?: I): Command_StartShake {
    return Command_StartShake.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_StartShake>, I>>(object: I): Command_StartShake {
    const message = createBaseCommand_StartShake();
    message.speed = object.speed ?? 0;
    message.acceleration = object.acceleration ?? 0;
    message.duration = object.duration ?? 0;
    return message;
  },
};

function createBaseCommand_StopShake(): Command_StopShake {
  return {};
}

export const Command_StopShake = {
  encode(_: Command_StopShake, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_StopShake {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_StopShake();
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

  fromJSON(_: any): Command_StopShake {
    return {};
  },

  toJSON(_: Command_StopShake): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_StopShake>, I>>(base?: I): Command_StopShake {
    return Command_StopShake.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_StopShake>, I>>(_: I): Command_StopShake {
    const message = createBaseCommand_StopShake();
    return message;
  },
};

function createBaseCommand_Reset(): Command_Reset {
  return {};
}

export const Command_Reset = {
  encode(_: Command_Reset, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_Reset {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_Reset();
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

  fromJSON(_: any): Command_Reset {
    return {};
  },

  toJSON(_: Command_Reset): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_Reset>, I>>(base?: I): Command_Reset {
    return Command_Reset.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_Reset>, I>>(_: I): Command_Reset {
    const message = createBaseCommand_Reset();
    return message;
  },
};

function createBaseCommand_WaitForShakeToFinish(): Command_WaitForShakeToFinish {
  return { timeout: 0 };
}

export const Command_WaitForShakeToFinish = {
  encode(message: Command_WaitForShakeToFinish, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.timeout !== 0) {
      writer.uint32(8).int32(message.timeout);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_WaitForShakeToFinish {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_WaitForShakeToFinish();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.timeout = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_WaitForShakeToFinish {
    return { timeout: isSet(object.timeout) ? Number(object.timeout) : 0 };
  },

  toJSON(message: Command_WaitForShakeToFinish): unknown {
    const obj: any = {};
    message.timeout !== undefined && (obj.timeout = Math.round(message.timeout));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_WaitForShakeToFinish>, I>>(base?: I): Command_WaitForShakeToFinish {
    return Command_WaitForShakeToFinish.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_WaitForShakeToFinish>, I>>(object: I): Command_WaitForShakeToFinish {
    const message = createBaseCommand_WaitForShakeToFinish();
    message.timeout = object.timeout ?? 0;
    return message;
  },
};

function createBaseCommand_TemperatureOn(): Command_TemperatureOn {
  return {};
}

export const Command_TemperatureOn = {
  encode(_: Command_TemperatureOn, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_TemperatureOn {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_TemperatureOn();
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

  fromJSON(_: any): Command_TemperatureOn {
    return {};
  },

  toJSON(_: Command_TemperatureOn): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_TemperatureOn>, I>>(base?: I): Command_TemperatureOn {
    return Command_TemperatureOn.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_TemperatureOn>, I>>(_: I): Command_TemperatureOn {
    const message = createBaseCommand_TemperatureOn();
    return message;
  },
};

function createBaseCommand_TemperatureOff(): Command_TemperatureOff {
  return {};
}

export const Command_TemperatureOff = {
  encode(_: Command_TemperatureOff, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_TemperatureOff {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_TemperatureOff();
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

  fromJSON(_: any): Command_TemperatureOff {
    return {};
  },

  toJSON(_: Command_TemperatureOff): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_TemperatureOff>, I>>(base?: I): Command_TemperatureOff {
    return Command_TemperatureOff.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_TemperatureOff>, I>>(_: I): Command_TemperatureOff {
    const message = createBaseCommand_TemperatureOff();
    return message;
  },
};

function createBaseCommand_SetTemperature(): Command_SetTemperature {
  return { temperature: 0 };
}

export const Command_SetTemperature = {
  encode(message: Command_SetTemperature, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.temperature !== 0) {
      writer.uint32(8).int32(message.temperature);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command_SetTemperature {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommand_SetTemperature();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.temperature = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Command_SetTemperature {
    return { temperature: isSet(object.temperature) ? Number(object.temperature) : 0 };
  },

  toJSON(message: Command_SetTemperature): unknown {
    const obj: any = {};
    message.temperature !== undefined && (obj.temperature = Math.round(message.temperature));
    return obj;
  },

  create<I extends Exact<DeepPartial<Command_SetTemperature>, I>>(base?: I): Command_SetTemperature {
    return Command_SetTemperature.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Command_SetTemperature>, I>>(object: I): Command_SetTemperature {
    const message = createBaseCommand_SetTemperature();
    message.temperature = object.temperature ?? 0;
    return message;
  },
};

function createBaseConfig(): Config {
  return { com_port: "" };
}

export const Config = {
  encode(message: Config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.com_port !== "") {
      writer.uint32(10).string(message.com_port);
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

          message.com_port = reader.string();
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
    return { com_port: isSet(object.com_port) ? String(object.com_port) : "" };
  },

  toJSON(message: Config): unknown {
    const obj: any = {};
    message.com_port !== undefined && (obj.com_port = message.com_port);
    return obj;
  },

  create<I extends Exact<DeepPartial<Config>, I>>(base?: I): Config {
    return Config.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Config>, I>>(object: I): Config {
    const message = createBaseConfig();
    message.com_port = object.com_port ?? "";
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
