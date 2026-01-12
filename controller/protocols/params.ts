import { z } from "zod";

export type ProtocolParamType = "boolean" | "string" | "number" | "label";

export interface ProtocolParamInfo {
  type: ProtocolParamType;
  options: string[];
  variable_id?: number;
  placeHolder?: string;
}

export const index = z.number().positive().int();

// Unused type and function - commented out
// type _Param<T extends z.ZodTypeAny, B extends ProtocolParamType> = z.ZodBranded<T, B> & {
//   _def: { _paramType: B };
// };

// function _Param<T extends z.ZodTypeAny, B extends ProtocolParamType>(name: B, type: T): _Param<T, B> {
//   const branded = type.brand(name) as _Param<T, B>;
//   branded._def._paramType = name;
//   return branded;
// }

export const params = z.object;
