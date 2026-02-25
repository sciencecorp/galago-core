import { z } from "zod";

export type ProtocolParameterType = "string" | "number" | "boolean" | "select";

export interface ProtocolParameter {
  name: string;
  label: string;
  type: ProtocolParameterType;
  defaultValue?: string;
  required?: boolean;
  options?: string[];
  description?: string;
}

export const zProtocolParameter = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["string", "number", "boolean", "select"]),
  defaultValue: z.string().optional(),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  description: z.string().optional(),
});
