import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { findOne, findMany } from "@/db/helpers";
import { forms, workcells, appSettings, logs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const zFormFieldOption = z.object({
  value: z.string(),
  label: z.string(),
});

const zFormField = z.object({
  type: z.enum([
    "text",
    "select",
    "radio",
    "checkbox",
    "textarea",
    "number",
    "date",
    "time",
    "file",
    "label",
  ]),
  label: z.string(),
  required: z.boolean().optional(),
  placeholder: z.string().nullable().optional(),
  options: z.array(zFormFieldOption).nullable().optional(),
  default_value: z
    .union([z.string(), z.array(z.string())])
    .nullable()
    .optional(),
  mapped_variable: z.string().nullable().optional(),
});

// Form schemas
const zFormBase = z.object({
  name: z.string().min(1, "Name is required"),
  fields: z.array(zFormField), // Now properly typed!
  backgroundColor: z.string().nullable().optional(),
  fontColor: z.string().nullable().optional(),
});

export const zFormCreate = zFormBase;

export const zFormUpdate = zFormBase
  .extend({
    id: z.number(),
  })
  .partial()
  .required({ id: true });

// Helper to get selected workcell ID
async function getSelectedWorkcellId(): Promise<number> {
  const setting = await findOne(appSettings, eq(appSettings.name, "workcell"));

  if (!setting || !setting.isActive) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No workcell is currently selected. Please select a workcell in settings.",
    });
  }

  const workcell = await findOne(workcells, eq(workcells.name, setting.value));

  if (!workcell) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Selected workcell '${setting.value}' not found`,
    });
  }

  return workcell.id;
}

export const formRouter = router({
  // Get all forms for selected workcell
  getAll: procedure.query(async () => {
    const workcellId = await getSelectedWorkcellId();
    const allForms = await findMany(forms, eq(forms.workcellId, workcellId));
    return allForms;
  }),

  // Get form by ID or name
  get: procedure.input(z.string()).query(async ({ input }) => {
    const numericId = parseInt(input);

    if (!isNaN(numericId)) {
      // Get by ID
      const form = await findOne(forms, eq(forms.id, numericId));
      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }
      return form;
    } else {
      // Get by name and workcell
      const workcellId = await getSelectedWorkcellId();
      const form = await findOne(
        forms,
        and(eq(forms.name, input), eq(forms.workcellId, workcellId))!,
      );

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }
      return form;
    }
  }),

  // Create new form
  add: procedure.input(zFormCreate).mutation(async ({ input }) => {
    const workcellId = await getSelectedWorkcellId();

    try {
      const result = await db
        .insert(forms)
        .values({
          name: input.name,
          fields: input.fields,
          backgroundColor: input.backgroundColor ?? null,
          fontColor: input.fontColor ?? null,
          workcellId: workcellId,
        })
        .returning();

      await db.insert(logs).values({
        level: "info",
        action: "New Form Added",
        details: `Form ${input.name} added successfully.`,
      });

      return result[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Form with name '${input.name}' already exists in this workcell`,
        });
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Failed to create form",
      });
    }
  }),

  // Update form
  edit: procedure.input(zFormUpdate).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    const existing = await findOne(forms, eq(forms.id, id));

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Form not found",
      });
    }

    try {
      // Filter out undefined values from updateData
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined),
      );

      const updated = await db
        .update(forms)
        .set({
          ...cleanUpdateData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(forms.id, id))
        .returning();

      await db.insert(logs).values({
        level: "info",
        action: "Form Edited",
        details: `Form ${input.name || existing.name} updated successfully.`,
      });

      return updated[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Form with name '${input.name}' already exists in this workcell`,
        });
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Failed to update form",
      });
    }
  }),

  // Delete form
  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    const deleted = await db.delete(forms).where(eq(forms.id, input)).returning();

    if (!deleted || deleted.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Form not found",
      });
    }

    await db.insert(logs).values({
      level: "info",
      action: "Form Deleted",
      details: `Form deleted successfully.`,
    });

    return { message: "Form deleted successfully" };
  }),

  // Export form configuration
  exportConfig: procedure.input(z.number()).query(async ({ input }) => {
    const form = await findOne(forms, eq(forms.id, input));
    if (!form) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Form not found",
      });
    }

    return form;
  }),

  // Export all forms
  exportAll: procedure.query(async () => {
    const workcellId = await getSelectedWorkcellId();
    const allForms = await findMany(forms, eq(forms.workcellId, workcellId));

    if (!allForms || allForms.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No forms found to export",
      });
    }

    return {
      forms: allForms,
      export_metadata: {
        export_date: new Date().toISOString(),
        total_forms: allForms.length,
        version: "1.0",
      },
    };
  }),

  // Import form configuration
  importConfig: procedure
    .input(
      z.object({
        name: z.string(),
        fields: z.any(),
        backgroundColor: z.string().nullable().optional(),
        fontColor: z.string().nullable().optional(),
        description: z.string().optional(),
        backgroundImage: z.string().optional(),
        size: z.string().optional(),
        isLocked: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const workcellId = await getSelectedWorkcellId();

      // Check if form with this name already exists
      const existingForm = await findOne(
        forms,
        and(eq(forms.name, input.name), eq(forms.workcellId, workcellId))!,
      );

      const formData = {
        name: input.name,
        fields: input.fields,
        backgroundColor: input.backgroundColor || null,
        fontColor: input.fontColor || null,
        workcellId,
      };

      if (existingForm) {
        // Update existing form
        const updated = await db
          .update(forms)
          .set({
            ...formData,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(forms.id, existingForm.id))
          .returning();

        await db.insert(logs).values({
          level: "info",
          action: "Form Imported (Updated)",
          details: `Form ${input.name} imported and updated successfully.`,
        });

        return updated[0];
      } else {
        // Create new form
        const created = await db.insert(forms).values(formData).returning();

        await db.insert(logs).values({
          level: "info",
          action: "Form Imported (Created)",
          details: `Form ${input.name} imported and created successfully.`,
        });

        return created[0];
      }
    }),
});
