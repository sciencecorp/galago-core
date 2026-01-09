import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { findOne, findMany, getSelectedWorkcellId } from "@/db/helpers";
import { variables, logs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Variable type validation
const variableTypeEnum = z.enum(["string", "number", "boolean", "array", "json"]);

// Base variable schema without id and WITHOUT workcellId
const zVariableBase = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string(),
  type: variableTypeEnum,
});

// Custom validation function for variable values based on type
function validateVariableValue(value: string, type: string): void {
  if (type === "string") {
    return;
  }

  if (type === "number") {
    if (value.trim() === "") {
      throw new Error("Number value cannot be empty");
    }
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`Value '${value}' is not a valid number`);
    }
    return;
  }

  if (type === "boolean") {
    const lower = value.trim().toLowerCase();
    if (lower !== "true" && lower !== "false") {
      throw new Error("Boolean value must be 'true' or 'false' (case insensitive)");
    }
    return;
  }

  if (type === "array") {
    const trimmed = value.trim();
    if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
      throw new Error("Array must start with [ and end with ]");
    }

    try {
      const parsed = JSON.parse(value);

      if (!Array.isArray(parsed)) {
        throw new Error("Array value must be a JSON array");
      }

      if (parsed.length === 0) {
        return;
      }

      const firstElement = parsed[0];
      const firstType = typeof firstElement;

      if (firstType !== "string" && firstType !== "number" && firstType !== "boolean") {
        throw new Error("Array elements must be strings, numbers, or booleans only");
      }

      for (let i = 0; i < parsed.length; i++) {
        const element = parsed[i];
        const elementType = typeof element;

        if (Array.isArray(element) || elementType === "object") {
          throw new Error("Nested arrays and objects are not allowed");
        }

        if (firstType === "number" && elementType === "number") {
          continue;
        } else if (elementType !== firstType) {
          throw new Error(
            `All array elements must be the same type. Found ${firstType} and ${elementType}`,
          );
        }
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Array must be valid JSON: ${error.message}`);
      }
      throw error;
    }
    return;
  }

  if (type === "json") {
    if (value.trim() === "") {
      throw new Error("JSON value cannot be empty");
    }
    try {
      JSON.parse(value);
    } catch (error) {
      throw new Error(
        `Invalid JSON format: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
    return;
  }

  throw new Error(`Unknown variable type: ${type}`);
}

// Create schema with validation (NO workcellId)
export const zVariableCreate = zVariableBase.refine(
  (data) => {
    try {
      validateVariableValue(data.value, data.type);
      return true;
    } catch (error) {
      return false;
    }
  },
  (data) => {
    try {
      validateVariableValue(data.value, data.type);
      return { message: "Value is valid" };
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : "Invalid value for type",
      };
    }
  },
);

// Update schema with validation (includes id, NO workcellId)
export const zVariableUpdate = zVariableBase
  .extend({
    id: z.number(),
  })
  .refine(
    (data) => {
      try {
        validateVariableValue(data.value, data.type);
        return true;
      } catch (error) {
        return false;
      }
    },
    (data) => {
      try {
        validateVariableValue(data.value, data.type);
        return { message: "Value is valid" };
      } catch (error) {
        return {
          message: error instanceof Error ? error.message : "Invalid value for type",
        };
      }
    },
  );

export const zVariable = zVariableBase.extend({
  id: z.number().optional(),
});

// Helper functions for parsing variable values
export const VariableHelpers = {
  parseArrayValue(value: string): string[] {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map((item) => String(item));
    } catch {
      return [];
    }
  },

  parseJsonValue(value: string): any {
    if (!value || value.trim() === "") {
      throw new Error("JSON value cannot be empty");
    }
    return JSON.parse(value);
  },

  parseBooleanValue(value: string): boolean {
    const lower = value.trim().toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
    throw new Error("Boolean value must be 'true' or 'false' (case insensitive)");
  },

  parseNumberValue(value: string): number {
    if (!value || value.trim() === "") {
      throw new Error("Number value cannot be empty");
    }
    const num = Number(value.trim());
    if (isNaN(num)) {
      throw new Error(`Value '${value}' is not a valid number`);
    }
    return num;
  },

  formatArrayValue(items: any[]): string {
    return JSON.stringify(items);
  },

  formatJsonValue(obj: any): string {
    return JSON.stringify(obj);
  },

  getParsedValue(variable: { value: string; type: string }): any {
    if (variable.type === "string") {
      return variable.value;
    } else if (variable.type === "number") {
      return this.parseNumberValue(variable.value);
    } else if (variable.type === "boolean") {
      return this.parseBooleanValue(variable.value);
    } else if (variable.type === "array") {
      return this.parseArrayValue(variable.value);
    } else if (variable.type === "json") {
      return this.parseJsonValue(variable.value);
    } else {
      return variable.value;
    }
  },

  validateAndFormatValue(value: string, variableType: string): string {
    if (variableType === "string") {
      return value;
    } else if (variableType === "number") {
      this.parseNumberValue(value);
      return value.trim();
    } else if (variableType === "boolean") {
      const parsed = this.parseBooleanValue(value);
      return parsed ? "true" : "false";
    } else if (variableType === "array") {
      const items = this.parseArrayValue(value);
      return this.formatArrayValue(items);
    } else if (variableType === "json") {
      const obj = this.parseJsonValue(value);
      return this.formatJsonValue(obj);
    } else {
      throw new Error(`Unknown variable type: ${variableType}`);
    }
  },
};

export const variableRouter = router({
  getAll: procedure.query(async () => {
    const workcellId = await getSelectedWorkcellId();
    const allVariables = await findMany(variables, eq(variables.workcellId, workcellId));
    return allVariables;
  }),

  get: procedure.input(z.string()).query(async ({ input }) => {
    const numericId = parseInt(input);

    if (!isNaN(numericId)) {
      const variable = await findOne(variables, eq(variables.id, numericId));

      if (!variable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variable not found",
        });
      }

      return variable;
    } else {
      const workcellId = await getSelectedWorkcellId();
      const variable = await db
        .select()
        .from(variables)
        .where(and(eq(variables.name, input), eq(variables.workcellId, workcellId)))
        .limit(1);

      if (!variable || variable.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variable not found",
        });
      }

      return variable[0];
    }
  }),

  add: procedure.input(zVariableCreate).mutation(async ({ input }) => {
    // Automatically get the selected workcell
    const workcellId = await getSelectedWorkcellId();

    try {
      const formattedValue = VariableHelpers.validateAndFormatValue(input.value, input.type);

      const result = await db
        .insert(variables)
        .values({
          ...input,
          value: formattedValue,
          workcellId, // Automatically assigned
        })
        .returning();

      await db.insert(logs).values({
        level: "info",
        action: "New Variable Added",
        details: `Variable ${input.name} of type ${input.type} added successfully.`,
      });

      return result[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Variable with that name already exists in this workcell",
        });
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Invalid variable data",
      });
    }
  }),

  edit: procedure.input(zVariableUpdate).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Variable ID is required",
      });
    }

    const existing = await findOne(variables, eq(variables.id, id));

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Variable not found",
      });
    }

    try {
      const formattedValue = VariableHelpers.validateAndFormatValue(
        updateData.value,
        updateData.type,
      );

      const updated = await db
        .update(variables)
        .set({
          ...updateData,
          value: formattedValue,
          updatedAt: new Date(),
          // Keep the existing workcellId - don't change it on update
        })
        .where(eq(variables.id, id))
        .returning();

      await db.insert(logs).values({
        level: "info",
        action: "Variable Edited",
        details: `Variable ${input.name} value updated to ${formattedValue}.`,
      });

      return updated[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Variable with that name already exists in this workcell",
        });
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Invalid variable data",
      });
    }
  }),

  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    const deleted = await db.delete(variables).where(eq(variables.id, input)).returning();

    if (!deleted || deleted.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Variable not found",
      });
    }

    await db.insert(logs).values({
      level: "info",
      action: "Variable Deleted",
      details: `Variable deleted successfully.`,
    });

    return { message: "Variable deleted successfully" };
  }),

  parseValue: procedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const variable = await findOne(variables, eq(variables.id, input.id));

      if (!variable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variable not found",
        });
      }

      try {
        return {
          ...variable,
          parsedValue: VariableHelpers.getParsedValue(variable),
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to parse variable value",
        });
      }
    }),
});
