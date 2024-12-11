export interface Variable {
  id?: number;
  name: string;
  value: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  created_at: string;
  updated_at: string;
}
