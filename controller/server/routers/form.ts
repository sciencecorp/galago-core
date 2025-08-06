import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { Form, FormField } from "@/types/";
import { get, post, put, del, uploadFile } from "../utils/api";
import { logAction } from "@/server/logger";

// Zod schema for form field options
export const zFormFieldOption = z.object({
  value: z.string(),
  label: z.string(),
  disabled: z.boolean().optional().default(false),
  description: z.string().optional(),
});

// Zod schema for form fields with proper nullable handling
export const zFormField = z.object({
  type: z.string(), // text, email, select, radio, checkbox, textarea, etc.
  label: z.string(),
  required: z.boolean().optional().default(false),
  placeholder: z.string().nullish(), // Use nullish() to allow null, undefined, or string
  description: z.string().nullish(),
  validation: z.record(z.any()).nullish(),
  options: z.array(zFormFieldOption).nullish(),
  default_value: z.union([z.string(), z.array(z.string())]).nullish(),
  mapped_variable: z.string().nullish(), // For variable mapping
});

// Transform function to clean null values to undefined for API consistency
const transformNullishToUndefined = <T extends Record<string, any>>(obj: T): T => {
  const cleaned = { ...obj };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === null) {
      cleaned[key] = undefined;
    }
  });
  return cleaned;
};

// Zod schema for forms
export const zForm = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string().nullish(),
  fields: z.array(zFormField),
  background_color: z.string().nullish(),
  font_color: z.string().nullish(),
  size: z.enum(["small", "medium", "large"]).optional().default("medium"),
  is_locked: z.boolean().optional().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Input schemas for mutations
export const zFormCreate = zForm.omit({ id: true, created_at: true, updated_at: true });
export const zFormUpdate = zForm.partial().omit({ created_at: true, updated_at: true });

export const formRouter = router({
  // Get all forms
  getAll: procedure.query(async () => {
    const response = await get<Form[]>(`/forms`);
    return response;
  }),

  // Get a specific form by ID
  get: procedure.input(z.number()).query(async ({ input }) => {
    const response = await get<Form>(`/forms/${input}`);
    return response;
  }),

  // Get a specific form by name
  getByName: procedure.input(z.string()).query(async ({ input }) => {
    const encodedName = encodeURIComponent(input);
    const response = await get<Form>(`/forms/name/${encodedName}`);
    return response;
  }),

  // Add new form
  add: procedure.input(zFormCreate).mutation(async ({ input }) => {
    // Clean the input data
    const cleanedInput = {
      ...transformNullishToUndefined(input),
      fields: input.fields.map((field) => transformNullishToUndefined(field)),
    };

    const response = await post<Form>(`/forms`, cleanedInput);
    logAction({
      level: "info",
      action: "New Form Created",
      details: `Form "${input.name}" created successfully with ${input.fields.length} fields.`,
    });
    return response;
  }),

  edit: procedure
    .input(
      z.object({
        id: z.number(),
        data: zFormUpdate,
      }),
    )
    .mutation(async ({ input }) => {
      const { id, data } = input;

      // Don't transform null values for colors - send them as-is
      const cleanedData = {
        ...data, // Keep null values intact
        fields: data.fields
          ? data.fields.map((field) => transformNullishToUndefined(field))
          : undefined,
      };

      const response = await put<Form>(`/forms/${id}`, cleanedData);
      logAction({
        level: "info",
        action: "Form Updated",
        details: `Form "${data.name || "ID:" + id}" updated successfully.`,
      });
      return response;
    }),

  // Delete form
  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    // Get form details before deletion for logging
    let formName = `ID: ${input}`;
    try {
      const form = await get<Form>(`/forms/${input}`);
      formName = form.name;
    } catch (error) {
      console.warn("Could not fetch form name for logging:", error);
    }

    await del(`/forms/${input}`);
    logAction({
      level: "info",
      action: "Form Deleted",
      details: `Form "${formName}" deleted successfully.`,
    });
    return { message: "Form deleted successfully" };
  }),

  // Duplicate a form
  duplicate: procedure
    .input(
      z.object({
        id: z.number(),
        newName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, newName } = input;

      // Create form data for the duplicate request
      const formData = new FormData();
      formData.append("new_name", newName);

      const response = await post<Form>(`/forms/${id}/duplicate`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      logAction({
        level: "info",
        action: "Form Duplicated",
        details: `Form duplicated as "${newName}".`,
      });
      return response;
    }),

  // Lock a form
  lock: procedure.input(z.number()).mutation(async ({ input }) => {
    const response = await put<Form>(`/forms/${input}/lock`, {});
    logAction({
      level: "info",
      action: "Form Locked",
      details: `Form ID ${input} has been locked.`,
    });
    return response;
  }),

  // Unlock a form
  unlock: procedure.input(z.number()).mutation(async ({ input }) => {
    const response = await put<Form>(`/forms/${input}/unlock`, {});
    logAction({
      level: "info",
      action: "Form Unlocked",
      details: `Form ID ${input} has been unlocked.`,
    });
    return response;
  }),

  // Export form config - returns the form data for download
  exportConfig: procedure.input(z.number()).mutation(async ({ input }) => {
    try {
      const formId = input;
      const response = await get<Form>(`/forms/${formId}/export`);
      logAction({
        level: "info",
        action: "Form Exported",
        details: `Form ID ${formId} exported successfully.`,
      });
      return response;
    } catch (error) {
      console.error("Form export failed:", error);
      logAction({
        level: "error",
        action: "Form Export Failed",
        details: `Failed to export form ID ${input}: ${error}`,
      });
      throw error;
    }
  }),

  // Import form config using file upload
  importConfig: procedure
    .input(
      z.object({
        file: z.any(), // File object from form data
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { file } = input;
        const response = await uploadFile<Form>("/forms/import", file);

        logAction({
          level: "info",
          action: "Form Imported",
          details: `Form "${response.name}" imported successfully.`,
        });
        return response;
      } catch (error) {
        console.error("Form import failed:", error);
        logAction({
          level: "error",
          action: "Form Import Failed",
          details: `Failed to import form: ${error}`,
        });
        throw error;
      }
    }),

  // Validate form data (useful for frontend validation)
  validate: procedure.input(zFormCreate).mutation(async ({ input }) => {
    // This endpoint doesn't actually call the API, just validates the form structure
    try {
      const validatedForm = zFormCreate.parse(input);
      return {
        valid: true,
        data: validatedForm,
        errors: null,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          data: null,
          errors: error.errors,
        };
      }
      throw error;
    }
  }),

  // Get forms with filtering options
  getFiltered: procedure
    .input(
      z.object({
        size: z.enum(["small", "medium", "large"]).optional(),
        isLocked: z.boolean().optional(),
        searchTerm: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      // Since your API doesn't have built-in filtering, we'll get all and filter client-side
      // You might want to add filtering to your FastAPI endpoints later
      const allForms = await get<Form[]>(`/forms`);

      let filteredForms = allForms;

      if (input.size) {
        filteredForms = filteredForms.filter((form) => form.size === input.size);
      }

      if (input.isLocked !== undefined) {
        filteredForms = filteredForms.filter((form) => form.is_locked === input.isLocked);
      }

      if (input.searchTerm) {
        const searchLower = input.searchTerm.toLowerCase();
        filteredForms = filteredForms.filter(
          (form) =>
            form.name.toLowerCase().includes(searchLower) ||
            (form.description && form.description.toLowerCase().includes(searchLower)),
        );
      }

      return filteredForms;
    }),

  // Get form statistics
  getStats: procedure.query(async () => {
    const allForms = await get<Form[]>(`/forms`);

    const stats = {
      total: allForms.length,
      locked: allForms.filter((form) => form.is_locked).length,
      unlocked: allForms.filter((form) => !form.is_locked).length,
      bySize: {
        small: allForms.filter((form) => form.size === "small").length,
        medium: allForms.filter((form) => form.size === "medium").length,
        large: allForms.filter((form) => form.size === "large").length,
      },
      averageFields:
        allForms.length > 0
          ? Math.round(
              allForms.reduce((sum, form) => sum + form.fields.length, 0) / allForms.length,
            )
          : 0,
    };

    return stats;
  }),
});
