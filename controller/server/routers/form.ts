import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { Form, FormField } from "@/types/api";
import { get, post, put, del, uploadFile } from "../utils/api";
import { logAction } from "@/server/logger";

// Zod schema for form field options
export const zFormFieldOption = z.object({
  value: z.string(),
  label: z.string(),
  disabled: z.boolean().optional().default(false),
  description: z.string().optional(),
});

// Zod schema for form fields
export const zFormField = z.object({
  type: z.string(), // text, email, select, radio, checkbox, textarea, etc.
  name: z.string(),
  label: z.string(),
  required: z.boolean().optional().default(false),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  validation: z.record(z.any()).optional(),
  options: z.array(zFormFieldOption).optional(),
  default_value: z.union([z.string(), z.array(z.string())]).optional(),
  mapped_variable: z.string().optional(), // For variable mapping
});

// Zod schema for forms
export const zForm = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string().optional(),
  fields: z.array(zFormField),
  background_color: z.string().optional(),
  background_image: z.string().optional(),
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
    const response = await post<Form>(`/forms`, input);
    logAction({
      level: "info",
      action: "New Form Created",
      details: `Form "${input.name}" created successfully with ${input.fields.length} fields.`,
    });
    return response;
  }),

  // Edit existing form
  edit: procedure
    .input(
      z.object({
        id: z.number(),
        data: zFormUpdate,
      })
    )
    .mutation(async ({ input }) => {
      const { id, data } = input;
      const response = await put<Form>(`/forms/${id}`, data);
      logAction({
        level: "info",
        action: "Form Updated",
        details: `Form "${data.name || 'ID:' + id}" updated successfully.`,
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
      })
    )
    .mutation(async ({ input }) => {
      const { id, newName } = input;
      
      // Create form data for the duplicate request
      const formData = new FormData();
      formData.append('new_name', newName);
      
      const response = await post<Form>(`/forms/${id}/duplicate`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
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
      })
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
      })
    )
    .query(async ({ input }) => {
      // Since your API doesn't have built-in filtering, we'll get all and filter client-side
      // You might want to add filtering to your FastAPI endpoints later
      const allForms = await get<Form[]>(`/forms`);
      
      let filteredForms = allForms;
      
      if (input.size) {
        filteredForms = filteredForms.filter(form => form.size === input.size);
      }
      
      if (input.isLocked !== undefined) {
        filteredForms = filteredForms.filter(form => form.is_locked === input.isLocked);
      }
      
      if (input.searchTerm) {
        const searchLower = input.searchTerm.toLowerCase();
        filteredForms = filteredForms.filter(form => 
          form.name.toLowerCase().includes(searchLower) ||
          (form.description && form.description.toLowerCase().includes(searchLower))
        );
      }
      
      return filteredForms;
    }),

  // Get form statistics
  getStats: procedure.query(async () => {
    const allForms = await get<Form[]>(`/forms`);
    
    const stats = {
      total: allForms.length,
      locked: allForms.filter(form => form.is_locked).length,
      unlocked: allForms.filter(form => !form.is_locked).length,
      bySize: {
        small: allForms.filter(form => form.size === "small").length,
        medium: allForms.filter(form => form.size === "medium").length,
        large: allForms.filter(form => form.size === "large").length,
      },
      averageFields: allForms.length > 0 
        ? Math.round(allForms.reduce((sum, form) => sum + form.fields.length, 0) / allForms.length)
        : 0,
    };
    
    return stats;
  }),

  // Batch operations
  batchDelete: procedure
    .input(z.array(z.number()))
    .mutation(async ({ input }) => {
      const deletePromises = input.map(id => del(`/forms/${id}`));
      await Promise.all(deletePromises);
      
      logAction({
        level: "info",
        action: "Batch Form Delete",
        details: `${input.length} forms deleted: IDs ${input.join(", ")}`,
      });
      
      return { message: `${input.length} forms deleted successfully` };
    }),

  batchLock: procedure
    .input(z.array(z.number()))
    .mutation(async ({ input }) => {
      const lockPromises = input.map(id => put<Form>(`/forms/${id}/lock`, {}));
      const results = await Promise.all(lockPromises);
      
      logAction({
        level: "info",
        action: "Batch Form Lock",
        details: `${input.length} forms locked: IDs ${input.join(", ")}`,
      });
      
      return results;
    }),

  batchUnlock: procedure
    .input(z.array(z.number()))
    .mutation(async ({ input }) => {
      const unlockPromises = input.map(id => put<Form>(`/forms/${id}/unlock`, {}));
      const results = await Promise.all(unlockPromises);
      
      logAction({
        level: "info",
        action: "Batch Form Unlock",
        details: `${input.length} forms unlocked: IDs ${input.join(", ")}`,
      });
      
      return results;
    }),
});