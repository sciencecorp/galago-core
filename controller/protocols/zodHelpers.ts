import { z } from "zod";
import * as util from "util";
import { ProtocolParamType } from "./params";

export type InnerZodType<W extends z.ZodTypeAny> = W extends MaybeWrappedZodType<infer I> ? I : W;

export type MaybeWrappedZodType<I extends z.ZodTypeAny> =
  | I
  | z.ZodLazy<I>
  | z.ZodEffects<I>
  | z.ZodDefault<I>
  | z.ZodArray<I>;

export function innerZodType<I extends z.ZodTypeAny>(type: MaybeWrappedZodType<I>): I {
  if (type instanceof z.ZodLazy) {
    return innerZodType(type.schema);
  } else if (type instanceof z.ZodEffects) {
    return innerZodType(type.innerType());
  } else if (type instanceof z.ZodDefault) {
    return innerZodType(type._def.innerType);
  } else if (type instanceof z.ZodArray) {
    return innerZodType(type._def.type);
  } else {
    return type;
  }
}

export function innerZodObjectShape<T extends MaybeWrappedZodType<z.AnyZodObject>>(
  paramSchema: T,
): InnerZodType<T> {
  return innerZodType(paramSchema).shape;
}

export function zodSchemaToTypeName(schema: z.ZodTypeAny): ProtocolParamType {
  const innerSchema = innerZodType(schema);
  switch (innerSchema._def.typeName) {
    case "ZodBranded":
      return innerSchema._def._paramType;
    case "ZodArray":
      return innerSchema._def._paramType;
    case "ZodString":
      return "string";
    case "ZodNumber":
      return "number";
    case "ZodBoolean":
      return "boolean";
    default:
      throw new Error(`Unknown zod type for schema ${util.inspect(schema, false, 10, false)}`);
  }
}

export function zodSchemaToEnumValues(schema: z.ZodTypeAny): string[] {
  const zodType: z.ZodFirstPartyTypeKind = schema._def.typeName;
  if (zodType === "ZodEnum") {
    return schema._def.values;
  } else if (zodType === "ZodDefault") {
    return zodSchemaToEnumValues(schema._def.innerType);
  }
  return [];
}

export function zodSchemaToDescription(schema: z.ZodTypeAny): string {
  return schema._def.description || "";
}

export function zodSchemaToDefault(schema: z.ZodTypeAny): any {
  const zodType: z.ZodFirstPartyTypeKind = schema._def.typeName;
  if (zodType === "ZodDefault") {
    return schema._def.defaultValue();
  }
  return undefined;
}
