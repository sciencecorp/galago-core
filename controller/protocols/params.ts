import { z } from "zod";

export type ProtocolParamType =
  | "boolean"
  | "string"
  | "number"
  | "enum"
  | "Barcode"
  | "WellPlateWithWells";

export interface ProtocolParamInfo {
  type: ProtocolParamType;
  description: string;
  options: string[];
  default?: string;
}

export const index = z.number().positive().int();

type Param<T extends z.ZodTypeAny, B extends ProtocolParamType> = z.ZodBranded<T, B> & {
  _def: { _paramType: B };
};

function Param<T extends z.ZodTypeAny, B extends ProtocolParamType>(name: B, type: T): Param<T, B> {
  const branded = type.brand(name) as Param<T, B>;
  branded._def._paramType = name;
  return branded;
}

export const Barcode = Param("Barcode", z.string().regex(/^\d{12}$/, "Barcode must be 12 digits"));
export type Barcode = z.infer<typeof Barcode>;

export const WellPlateType = z
  .enum(["6", "12", "24", "96", "384","4_slide_holder"])
  .brand<"WellPlateType">();
export type WellPlateType = z.infer<typeof WellPlateType>;
function wellsInWellPlateType(type: z.infer<typeof WellPlateType>): number {
  return parseInt(type) || 0;
}

export const LiconicLocation = z
  .object({
    cassette: index.describe("The cassette number to load from the Liconic"),
    level: index.describe("The level number to load from the Liconic"),
  })
  .brand<"LiconicLocation">();
export type LiconicLocation = z.infer<typeof LiconicLocation>;

export const WellPlateWithWells = Param(
  "WellPlateWithWells",
  z
    .object({
      barcode: Barcode,
      type: WellPlateType,
      wells: index.array(),
      location: LiconicLocation,
    })
    .refine(
      (data) => data.wells.length <= wellsInWellPlateType(data.type),
      "Too many wells selected for plate type"
    )
);
export type WellPlateWithWells = z.infer<typeof WellPlateWithWells>;

export const params = z.object;
