/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces.labware";

export interface Labware {
  id: number;
  name: string;
  image_url: string;
  description: string;
  number_of_rows: number;
  number_of_columns: number;
  z_offset: number;
  width: number;
  height: number;
  plate_lid_offset: number;
  lid_offset: number;
  stack_height: number;
  has_lid: boolean;
}

function createBaseLabware(): Labware {
  return {
    id: 0,
    name: "",
    image_url: "",
    description: "",
    number_of_rows: 0,
    number_of_columns: 0,
    z_offset: 0,
    width: 0,
    height: 0,
    plate_lid_offset: 0,
    lid_offset: 0,
    stack_height: 0,
    has_lid: false,
  };
}

export const Labware = {
  encode(message: Labware, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.image_url !== "") {
      writer.uint32(26).string(message.image_url);
    }
    if (message.description !== "") {
      writer.uint32(34).string(message.description);
    }
    if (message.number_of_rows !== 0) {
      writer.uint32(40).int32(message.number_of_rows);
    }
    if (message.number_of_columns !== 0) {
      writer.uint32(48).int32(message.number_of_columns);
    }
    if (message.z_offset !== 0) {
      writer.uint32(61).float(message.z_offset);
    }
    if (message.width !== 0) {
      writer.uint32(69).float(message.width);
    }
    if (message.height !== 0) {
      writer.uint32(77).float(message.height);
    }
    if (message.plate_lid_offset !== 0) {
      writer.uint32(85).float(message.plate_lid_offset);
    }
    if (message.lid_offset !== 0) {
      writer.uint32(93).float(message.lid_offset);
    }
    if (message.stack_height !== 0) {
      writer.uint32(101).float(message.stack_height);
    }
    if (message.has_lid === true) {
      writer.uint32(104).bool(message.has_lid);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Labware {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLabware();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
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

          message.image_url = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.description = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.number_of_rows = reader.int32();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.number_of_columns = reader.int32();
          continue;
        case 7:
          if (tag !== 61) {
            break;
          }

          message.z_offset = reader.float();
          continue;
        case 8:
          if (tag !== 69) {
            break;
          }

          message.width = reader.float();
          continue;
        case 9:
          if (tag !== 77) {
            break;
          }

          message.height = reader.float();
          continue;
        case 10:
          if (tag !== 85) {
            break;
          }

          message.plate_lid_offset = reader.float();
          continue;
        case 11:
          if (tag !== 93) {
            break;
          }

          message.lid_offset = reader.float();
          continue;
        case 12:
          if (tag !== 101) {
            break;
          }

          message.stack_height = reader.float();
          continue;
        case 13:
          if (tag !== 104) {
            break;
          }

          message.has_lid = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Labware {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      name: isSet(object.name) ? String(object.name) : "",
      image_url: isSet(object.image_url) ? String(object.image_url) : "",
      description: isSet(object.description) ? String(object.description) : "",
      number_of_rows: isSet(object.number_of_rows) ? Number(object.number_of_rows) : 0,
      number_of_columns: isSet(object.number_of_columns) ? Number(object.number_of_columns) : 0,
      z_offset: isSet(object.z_offset) ? Number(object.z_offset) : 0,
      width: isSet(object.width) ? Number(object.width) : 0,
      height: isSet(object.height) ? Number(object.height) : 0,
      plate_lid_offset: isSet(object.plate_lid_offset) ? Number(object.plate_lid_offset) : 0,
      lid_offset: isSet(object.lid_offset) ? Number(object.lid_offset) : 0,
      stack_height: isSet(object.stack_height) ? Number(object.stack_height) : 0,
      has_lid: isSet(object.has_lid) ? Boolean(object.has_lid) : false,
    };
  },

  toJSON(message: Labware): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.name !== undefined && (obj.name = message.name);
    message.image_url !== undefined && (obj.image_url = message.image_url);
    message.description !== undefined && (obj.description = message.description);
    message.number_of_rows !== undefined && (obj.number_of_rows = Math.round(message.number_of_rows));
    message.number_of_columns !== undefined && (obj.number_of_columns = Math.round(message.number_of_columns));
    message.z_offset !== undefined && (obj.z_offset = message.z_offset);
    message.width !== undefined && (obj.width = message.width);
    message.height !== undefined && (obj.height = message.height);
    message.plate_lid_offset !== undefined && (obj.plate_lid_offset = message.plate_lid_offset);
    message.lid_offset !== undefined && (obj.lid_offset = message.lid_offset);
    message.stack_height !== undefined && (obj.stack_height = message.stack_height);
    message.has_lid !== undefined && (obj.has_lid = message.has_lid);
    return obj;
  },

  create<I extends Exact<DeepPartial<Labware>, I>>(base?: I): Labware {
    return Labware.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Labware>, I>>(object: I): Labware {
    const message = createBaseLabware();
    message.id = object.id ?? 0;
    message.name = object.name ?? "";
    message.image_url = object.image_url ?? "";
    message.description = object.description ?? "";
    message.number_of_rows = object.number_of_rows ?? 0;
    message.number_of_columns = object.number_of_columns ?? 0;
    message.z_offset = object.z_offset ?? 0;
    message.width = object.width ?? 0;
    message.height = object.height ?? 0;
    message.plate_lid_offset = object.plate_lid_offset ?? 0;
    message.lid_offset = object.lid_offset ?? 0;
    message.stack_height = object.stack_height ?? 0;
    message.has_lid = object.has_lid ?? false;
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
