/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "com.science.foundry";

export enum PlateType {
  PLATE_6_WELL = "PLATE_6_WELL",
  PLATE_24_WELL = "PLATE_24_WELL",
  PLATE_96_WELL = "PLATE_96_WELL",
  PLATE_10_CM = "PLATE_10_CM",
  PLATE_JB = "PLATE_JB",
  PLATE_MEA = "PLATE_MEA",
  PLATE_T175_FLASK = "PLATE_T175_FLASK",
  PLATE_12_WELL = "PLATE_12_WELL",
  PLATE_8_CHAMBERED_SIDE = "PLATE_8_CHAMBERED_SIDE",
  PLATE_MICROCHAMBER_ARRAY_16_WELL = "PLATE_MICROCHAMBER_ARRAY_16_WELL",
  PLATE_MICROCHAMBER_ARRAY_8_WELL = "PLATE_MICROCHAMBER_ARRAY_8_WELL",
  PLATE_1_WELL = "PLATE_1_WELL",
  PLATE_PDMS_WELL_TALL_CHAMBERS = "PLATE_PDMS_WELL_TALL_CHAMBERS",
  PLATE_PDMS_WELL_SHORT_CHAMBERS = "PLATE_PDMS_WELL_SHORT_CHAMBERS",
  PLATE_48_WELL_PLATE = "PLATE_48_WELL_PLATE",
  UNRECOGNIZED = "UNRECOGNIZED",
}

export function plateTypeFromJSON(object: any): PlateType {
  switch (object) {
    case 0:
    case "PLATE_6_WELL":
      return PlateType.PLATE_6_WELL;
    case 1:
    case "PLATE_24_WELL":
      return PlateType.PLATE_24_WELL;
    case 2:
    case "PLATE_96_WELL":
      return PlateType.PLATE_96_WELL;
    case 3:
    case "PLATE_10_CM":
      return PlateType.PLATE_10_CM;
    case 4:
    case "PLATE_JB":
      return PlateType.PLATE_JB;
    case 5:
    case "PLATE_MEA":
      return PlateType.PLATE_MEA;
    case 6:
    case "PLATE_T175_FLASK":
      return PlateType.PLATE_T175_FLASK;
    case 7:
    case "PLATE_12_WELL":
      return PlateType.PLATE_12_WELL;
    case 8:
    case "PLATE_8_CHAMBERED_SIDE":
      return PlateType.PLATE_8_CHAMBERED_SIDE;
    case 9:
    case "PLATE_MICROCHAMBER_ARRAY_16_WELL":
      return PlateType.PLATE_MICROCHAMBER_ARRAY_16_WELL;
    case 10:
    case "PLATE_MICROCHAMBER_ARRAY_8_WELL":
      return PlateType.PLATE_MICROCHAMBER_ARRAY_8_WELL;
    case 11:
    case "PLATE_1_WELL":
      return PlateType.PLATE_1_WELL;
    case 12:
    case "PLATE_PDMS_WELL_TALL_CHAMBERS":
      return PlateType.PLATE_PDMS_WELL_TALL_CHAMBERS;
    case 13:
    case "PLATE_PDMS_WELL_SHORT_CHAMBERS":
      return PlateType.PLATE_PDMS_WELL_SHORT_CHAMBERS;
    case 14:
    case "PLATE_48_WELL_PLATE":
      return PlateType.PLATE_48_WELL_PLATE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return PlateType.UNRECOGNIZED;
  }
}

export function plateTypeToJSON(object: PlateType): string {
  switch (object) {
    case PlateType.PLATE_6_WELL:
      return "PLATE_6_WELL";
    case PlateType.PLATE_24_WELL:
      return "PLATE_24_WELL";
    case PlateType.PLATE_96_WELL:
      return "PLATE_96_WELL";
    case PlateType.PLATE_10_CM:
      return "PLATE_10_CM";
    case PlateType.PLATE_JB:
      return "PLATE_JB";
    case PlateType.PLATE_MEA:
      return "PLATE_MEA";
    case PlateType.PLATE_T175_FLASK:
      return "PLATE_T175_FLASK";
    case PlateType.PLATE_12_WELL:
      return "PLATE_12_WELL";
    case PlateType.PLATE_8_CHAMBERED_SIDE:
      return "PLATE_8_CHAMBERED_SIDE";
    case PlateType.PLATE_MICROCHAMBER_ARRAY_16_WELL:
      return "PLATE_MICROCHAMBER_ARRAY_16_WELL";
    case PlateType.PLATE_MICROCHAMBER_ARRAY_8_WELL:
      return "PLATE_MICROCHAMBER_ARRAY_8_WELL";
    case PlateType.PLATE_1_WELL:
      return "PLATE_1_WELL";
    case PlateType.PLATE_PDMS_WELL_TALL_CHAMBERS:
      return "PLATE_PDMS_WELL_TALL_CHAMBERS";
    case PlateType.PLATE_PDMS_WELL_SHORT_CHAMBERS:
      return "PLATE_PDMS_WELL_SHORT_CHAMBERS";
    case PlateType.PLATE_48_WELL_PLATE:
      return "PLATE_48_WELL_PLATE";
    case PlateType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export function plateTypeToNumber(object: PlateType): number {
  switch (object) {
    case PlateType.PLATE_6_WELL:
      return 0;
    case PlateType.PLATE_24_WELL:
      return 1;
    case PlateType.PLATE_96_WELL:
      return 2;
    case PlateType.PLATE_10_CM:
      return 3;
    case PlateType.PLATE_JB:
      return 4;
    case PlateType.PLATE_MEA:
      return 5;
    case PlateType.PLATE_T175_FLASK:
      return 6;
    case PlateType.PLATE_12_WELL:
      return 7;
    case PlateType.PLATE_8_CHAMBERED_SIDE:
      return 8;
    case PlateType.PLATE_MICROCHAMBER_ARRAY_16_WELL:
      return 9;
    case PlateType.PLATE_MICROCHAMBER_ARRAY_8_WELL:
      return 10;
    case PlateType.PLATE_1_WELL:
      return 11;
    case PlateType.PLATE_PDMS_WELL_TALL_CHAMBERS:
      return 12;
    case PlateType.PLATE_PDMS_WELL_SHORT_CHAMBERS:
      return 13;
    case PlateType.PLATE_48_WELL_PLATE:
      return 14;
    case PlateType.UNRECOGNIZED:
    default:
      return -1;
  }
}

/**
 * A Plate represents a container reference that can be passed around between
 * instructions - it identifies a specific physical plate, either one new to
 * this protocol (provisioned with NewPlate) or an existing plate retrieved from
 * storage (via RetrievePlate).
 */
export interface Plate {
  ref: string;
}

/** Provision a new plate of the given type */
export interface NewPlate {
  plate: Plate | undefined;
  plate_type: PlateType;
}

/** Locate and retrieve a plate in its current location */
export interface RetrievePlate {
  plate: Plate | undefined;
  id: string;
}

export interface StorePlate {
  /** end */
  plate: Plate | undefined;
  where: StorePlate_StorageTemp;
}

export enum StorePlate_StorageTemp {
  UNSPECIFIED = "UNSPECIFIED",
  AMBIENT = "AMBIENT",
  COLD_80 = "COLD_80",
  COLD_20 = "COLD_20",
  COLD_4 = "COLD_4",
  WARM_30 = "WARM_30",
  WARM_37 = "WARM_37",
  UNRECOGNIZED = "UNRECOGNIZED",
}

export function storePlate_StorageTempFromJSON(object: any): StorePlate_StorageTemp {
  switch (object) {
    case 0:
    case "UNSPECIFIED":
      return StorePlate_StorageTemp.UNSPECIFIED;
    case 1:
    case "AMBIENT":
      return StorePlate_StorageTemp.AMBIENT;
    case 2:
    case "COLD_80":
      return StorePlate_StorageTemp.COLD_80;
    case 3:
    case "COLD_20":
      return StorePlate_StorageTemp.COLD_20;
    case 4:
    case "COLD_4":
      return StorePlate_StorageTemp.COLD_4;
    case 5:
    case "WARM_30":
      return StorePlate_StorageTemp.WARM_30;
    case 6:
    case "WARM_37":
      return StorePlate_StorageTemp.WARM_37;
    case -1:
    case "UNRECOGNIZED":
    default:
      return StorePlate_StorageTemp.UNRECOGNIZED;
  }
}

export function storePlate_StorageTempToJSON(object: StorePlate_StorageTemp): string {
  switch (object) {
    case StorePlate_StorageTemp.UNSPECIFIED:
      return "UNSPECIFIED";
    case StorePlate_StorageTemp.AMBIENT:
      return "AMBIENT";
    case StorePlate_StorageTemp.COLD_80:
      return "COLD_80";
    case StorePlate_StorageTemp.COLD_20:
      return "COLD_20";
    case StorePlate_StorageTemp.COLD_4:
      return "COLD_4";
    case StorePlate_StorageTemp.WARM_30:
      return "WARM_30";
    case StorePlate_StorageTemp.WARM_37:
      return "WARM_37";
    case StorePlate_StorageTemp.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export function storePlate_StorageTempToNumber(object: StorePlate_StorageTemp): number {
  switch (object) {
    case StorePlate_StorageTemp.UNSPECIFIED:
      return 0;
    case StorePlate_StorageTemp.AMBIENT:
      return 1;
    case StorePlate_StorageTemp.COLD_80:
      return 2;
    case StorePlate_StorageTemp.COLD_20:
      return 3;
    case StorePlate_StorageTemp.COLD_4:
      return 4;
    case StorePlate_StorageTemp.WARM_30:
      return 5;
    case StorePlate_StorageTemp.WARM_37:
      return 6;
    case StorePlate_StorageTemp.UNRECOGNIZED:
    default:
      return -1;
  }
}

export interface DiscardPlate {
  plate: Plate | undefined;
  destroy?: boolean | undefined;
  recycle?: boolean | undefined;
}

export interface CytationImage {
  plate: Plate | undefined;
  program_file: string;
  experiment_name?: string | undefined;
}

export interface Instruction {
  new_plate?: NewPlate | undefined;
  retrieve_plate?: RetrievePlate | undefined;
  store_plate?: StorePlate | undefined;
  discard_plate?: DiscardPlate | undefined;
  cytation_image?: CytationImage | undefined;
}

export interface Protocol {
  instructions: Instruction[];
}

function createBasePlate(): Plate {
  return { ref: "" };
}

export const Plate = {
  encode(message: Plate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.ref !== "") {
      writer.uint32(10).string(message.ref);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Plate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.ref = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Plate {
    return { ref: isSet(object.ref) ? String(object.ref) : "" };
  },

  toJSON(message: Plate): unknown {
    const obj: any = {};
    message.ref !== undefined && (obj.ref = message.ref);
    return obj;
  },

  create<I extends Exact<DeepPartial<Plate>, I>>(base?: I): Plate {
    return Plate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Plate>, I>>(object: I): Plate {
    const message = createBasePlate();
    message.ref = object.ref ?? "";
    return message;
  },
};

function createBaseNewPlate(): NewPlate {
  return { plate: undefined, plate_type: PlateType.PLATE_6_WELL };
}

export const NewPlate = {
  encode(message: NewPlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plate !== undefined) {
      Plate.encode(message.plate, writer.uint32(10).fork()).ldelim();
    }
    if (message.plate_type !== PlateType.PLATE_6_WELL) {
      writer.uint32(16).int32(plateTypeToNumber(message.plate_type));
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NewPlate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNewPlate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.plate = Plate.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.plate_type = plateTypeFromJSON(reader.int32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): NewPlate {
    return {
      plate: isSet(object.plate) ? Plate.fromJSON(object.plate) : undefined,
      plate_type: isSet(object.plate_type) ? plateTypeFromJSON(object.plate_type) : PlateType.PLATE_6_WELL,
    };
  },

  toJSON(message: NewPlate): unknown {
    const obj: any = {};
    message.plate !== undefined && (obj.plate = message.plate ? Plate.toJSON(message.plate) : undefined);
    message.plate_type !== undefined && (obj.plate_type = plateTypeToJSON(message.plate_type));
    return obj;
  },

  create<I extends Exact<DeepPartial<NewPlate>, I>>(base?: I): NewPlate {
    return NewPlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<NewPlate>, I>>(object: I): NewPlate {
    const message = createBaseNewPlate();
    message.plate = (object.plate !== undefined && object.plate !== null) ? Plate.fromPartial(object.plate) : undefined;
    message.plate_type = object.plate_type ?? PlateType.PLATE_6_WELL;
    return message;
  },
};

function createBaseRetrievePlate(): RetrievePlate {
  return { plate: undefined, id: "" };
}

export const RetrievePlate = {
  encode(message: RetrievePlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plate !== undefined) {
      Plate.encode(message.plate, writer.uint32(10).fork()).ldelim();
    }
    if (message.id !== "") {
      writer.uint32(18).string(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RetrievePlate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRetrievePlate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.plate = Plate.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.id = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RetrievePlate {
    return {
      plate: isSet(object.plate) ? Plate.fromJSON(object.plate) : undefined,
      id: isSet(object.id) ? String(object.id) : "",
    };
  },

  toJSON(message: RetrievePlate): unknown {
    const obj: any = {};
    message.plate !== undefined && (obj.plate = message.plate ? Plate.toJSON(message.plate) : undefined);
    message.id !== undefined && (obj.id = message.id);
    return obj;
  },

  create<I extends Exact<DeepPartial<RetrievePlate>, I>>(base?: I): RetrievePlate {
    return RetrievePlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<RetrievePlate>, I>>(object: I): RetrievePlate {
    const message = createBaseRetrievePlate();
    message.plate = (object.plate !== undefined && object.plate !== null) ? Plate.fromPartial(object.plate) : undefined;
    message.id = object.id ?? "";
    return message;
  },
};

function createBaseStorePlate(): StorePlate {
  return { plate: undefined, where: StorePlate_StorageTemp.UNSPECIFIED };
}

export const StorePlate = {
  encode(message: StorePlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plate !== undefined) {
      Plate.encode(message.plate, writer.uint32(10).fork()).ldelim();
    }
    if (message.where !== StorePlate_StorageTemp.UNSPECIFIED) {
      writer.uint32(16).int32(storePlate_StorageTempToNumber(message.where));
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StorePlate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStorePlate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.plate = Plate.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.where = storePlate_StorageTempFromJSON(reader.int32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StorePlate {
    return {
      plate: isSet(object.plate) ? Plate.fromJSON(object.plate) : undefined,
      where: isSet(object.where) ? storePlate_StorageTempFromJSON(object.where) : StorePlate_StorageTemp.UNSPECIFIED,
    };
  },

  toJSON(message: StorePlate): unknown {
    const obj: any = {};
    message.plate !== undefined && (obj.plate = message.plate ? Plate.toJSON(message.plate) : undefined);
    message.where !== undefined && (obj.where = storePlate_StorageTempToJSON(message.where));
    return obj;
  },

  create<I extends Exact<DeepPartial<StorePlate>, I>>(base?: I): StorePlate {
    return StorePlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StorePlate>, I>>(object: I): StorePlate {
    const message = createBaseStorePlate();
    message.plate = (object.plate !== undefined && object.plate !== null) ? Plate.fromPartial(object.plate) : undefined;
    message.where = object.where ?? StorePlate_StorageTemp.UNSPECIFIED;
    return message;
  },
};

function createBaseDiscardPlate(): DiscardPlate {
  return { plate: undefined, destroy: undefined, recycle: undefined };
}

export const DiscardPlate = {
  encode(message: DiscardPlate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plate !== undefined) {
      Plate.encode(message.plate, writer.uint32(10).fork()).ldelim();
    }
    if (message.destroy !== undefined) {
      writer.uint32(16).bool(message.destroy);
    }
    if (message.recycle !== undefined) {
      writer.uint32(24).bool(message.recycle);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DiscardPlate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDiscardPlate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.plate = Plate.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.destroy = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.recycle = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DiscardPlate {
    return {
      plate: isSet(object.plate) ? Plate.fromJSON(object.plate) : undefined,
      destroy: isSet(object.destroy) ? Boolean(object.destroy) : undefined,
      recycle: isSet(object.recycle) ? Boolean(object.recycle) : undefined,
    };
  },

  toJSON(message: DiscardPlate): unknown {
    const obj: any = {};
    message.plate !== undefined && (obj.plate = message.plate ? Plate.toJSON(message.plate) : undefined);
    message.destroy !== undefined && (obj.destroy = message.destroy);
    message.recycle !== undefined && (obj.recycle = message.recycle);
    return obj;
  },

  create<I extends Exact<DeepPartial<DiscardPlate>, I>>(base?: I): DiscardPlate {
    return DiscardPlate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<DiscardPlate>, I>>(object: I): DiscardPlate {
    const message = createBaseDiscardPlate();
    message.plate = (object.plate !== undefined && object.plate !== null) ? Plate.fromPartial(object.plate) : undefined;
    message.destroy = object.destroy ?? undefined;
    message.recycle = object.recycle ?? undefined;
    return message;
  },
};

function createBaseCytationImage(): CytationImage {
  return { plate: undefined, program_file: "", experiment_name: undefined };
}

export const CytationImage = {
  encode(message: CytationImage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plate !== undefined) {
      Plate.encode(message.plate, writer.uint32(10).fork()).ldelim();
    }
    if (message.program_file !== "") {
      writer.uint32(18).string(message.program_file);
    }
    if (message.experiment_name !== undefined) {
      writer.uint32(26).string(message.experiment_name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CytationImage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCytationImage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.plate = Plate.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.program_file = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.experiment_name = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CytationImage {
    return {
      plate: isSet(object.plate) ? Plate.fromJSON(object.plate) : undefined,
      program_file: isSet(object.program_file) ? String(object.program_file) : "",
      experiment_name: isSet(object.experiment_name) ? String(object.experiment_name) : undefined,
    };
  },

  toJSON(message: CytationImage): unknown {
    const obj: any = {};
    message.plate !== undefined && (obj.plate = message.plate ? Plate.toJSON(message.plate) : undefined);
    message.program_file !== undefined && (obj.program_file = message.program_file);
    message.experiment_name !== undefined && (obj.experiment_name = message.experiment_name);
    return obj;
  },

  create<I extends Exact<DeepPartial<CytationImage>, I>>(base?: I): CytationImage {
    return CytationImage.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<CytationImage>, I>>(object: I): CytationImage {
    const message = createBaseCytationImage();
    message.plate = (object.plate !== undefined && object.plate !== null) ? Plate.fromPartial(object.plate) : undefined;
    message.program_file = object.program_file ?? "";
    message.experiment_name = object.experiment_name ?? undefined;
    return message;
  },
};

function createBaseInstruction(): Instruction {
  return {
    new_plate: undefined,
    retrieve_plate: undefined,
    store_plate: undefined,
    discard_plate: undefined,
    cytation_image: undefined,
  };
}

export const Instruction = {
  encode(message: Instruction, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.new_plate !== undefined) {
      NewPlate.encode(message.new_plate, writer.uint32(10).fork()).ldelim();
    }
    if (message.retrieve_plate !== undefined) {
      RetrievePlate.encode(message.retrieve_plate, writer.uint32(18).fork()).ldelim();
    }
    if (message.store_plate !== undefined) {
      StorePlate.encode(message.store_plate, writer.uint32(26).fork()).ldelim();
    }
    if (message.discard_plate !== undefined) {
      DiscardPlate.encode(message.discard_plate, writer.uint32(34).fork()).ldelim();
    }
    if (message.cytation_image !== undefined) {
      CytationImage.encode(message.cytation_image, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Instruction {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstruction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.new_plate = NewPlate.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.retrieve_plate = RetrievePlate.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.store_plate = StorePlate.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.discard_plate = DiscardPlate.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.cytation_image = CytationImage.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Instruction {
    return {
      new_plate: isSet(object.new_plate) ? NewPlate.fromJSON(object.new_plate) : undefined,
      retrieve_plate: isSet(object.retrieve_plate) ? RetrievePlate.fromJSON(object.retrieve_plate) : undefined,
      store_plate: isSet(object.store_plate) ? StorePlate.fromJSON(object.store_plate) : undefined,
      discard_plate: isSet(object.discard_plate) ? DiscardPlate.fromJSON(object.discard_plate) : undefined,
      cytation_image: isSet(object.cytation_image) ? CytationImage.fromJSON(object.cytation_image) : undefined,
    };
  },

  toJSON(message: Instruction): unknown {
    const obj: any = {};
    message.new_plate !== undefined &&
      (obj.new_plate = message.new_plate ? NewPlate.toJSON(message.new_plate) : undefined);
    message.retrieve_plate !== undefined &&
      (obj.retrieve_plate = message.retrieve_plate ? RetrievePlate.toJSON(message.retrieve_plate) : undefined);
    message.store_plate !== undefined &&
      (obj.store_plate = message.store_plate ? StorePlate.toJSON(message.store_plate) : undefined);
    message.discard_plate !== undefined &&
      (obj.discard_plate = message.discard_plate ? DiscardPlate.toJSON(message.discard_plate) : undefined);
    message.cytation_image !== undefined &&
      (obj.cytation_image = message.cytation_image ? CytationImage.toJSON(message.cytation_image) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Instruction>, I>>(base?: I): Instruction {
    return Instruction.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Instruction>, I>>(object: I): Instruction {
    const message = createBaseInstruction();
    message.new_plate = (object.new_plate !== undefined && object.new_plate !== null)
      ? NewPlate.fromPartial(object.new_plate)
      : undefined;
    message.retrieve_plate = (object.retrieve_plate !== undefined && object.retrieve_plate !== null)
      ? RetrievePlate.fromPartial(object.retrieve_plate)
      : undefined;
    message.store_plate = (object.store_plate !== undefined && object.store_plate !== null)
      ? StorePlate.fromPartial(object.store_plate)
      : undefined;
    message.discard_plate = (object.discard_plate !== undefined && object.discard_plate !== null)
      ? DiscardPlate.fromPartial(object.discard_plate)
      : undefined;
    message.cytation_image = (object.cytation_image !== undefined && object.cytation_image !== null)
      ? CytationImage.fromPartial(object.cytation_image)
      : undefined;
    return message;
  },
};

function createBaseProtocol(): Protocol {
  return { instructions: [] };
}

export const Protocol = {
  encode(message: Protocol, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.instructions) {
      Instruction.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Protocol {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProtocol();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.instructions.push(Instruction.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Protocol {
    return {
      instructions: Array.isArray(object?.instructions)
        ? object.instructions.map((e: any) => Instruction.fromJSON(e))
        : [],
    };
  },

  toJSON(message: Protocol): unknown {
    const obj: any = {};
    if (message.instructions) {
      obj.instructions = message.instructions.map((e) => e ? Instruction.toJSON(e) : undefined);
    } else {
      obj.instructions = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Protocol>, I>>(base?: I): Protocol {
    return Protocol.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Protocol>, I>>(object: I): Protocol {
    const message = createBaseProtocol();
    message.instructions = object.instructions?.map((e) => Instruction.fromPartial(e)) || [];
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
