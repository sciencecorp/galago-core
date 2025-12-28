import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { Form, FormField } from "@/types";
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
  type: z.string(), // text, select, radio, checkbox, textarea, etc.
  label: z.string(),
  required: z.boolean().optional().default(false),
  placeholder: z.string().nullish(), // Use nullish() to allow null, undefined, or string
  description: z.string().nullish(),
  validation: z.record(z.any()).nullish(),
  options: z.array(zFormFieldOption).nullish(),
  default_value: z.union([z.string(), z.array(z.string())]).nullish(),
  mapped_variable: z.string().nullish(), // For variable mapping
});

export const zForm = z.object({
  id: z.number().optional(),
  name: z.string(),
  fields: z.array(zFormField),
  background_color: z.string().nullish(),
  font_color: z.string().nullish(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Input schemas for mutations
export const zFormCreate = zForm.omit({ id: true, created_at: true, updated_at: true });
export const zFormUpdate = zForm.partial().omit({ created_at: true, updated_at: true });

export const formRouter = router({
  // Get all forms
  getAll: procedure.query(async () => {
    const response = await get<Form[]>("/forms");
    return response;
  }),

  // Get a specific form by name
  get: procedure.input(z.string()).query(async ({ input }) => {
    const response = await get<Form>(`/forms/${input}`);
    return response;
  }),

  // New form
  add: procedure.input(zFormCreate).mutation(async ({ input }) => {
    const response = await post<Form>("/forms", input);
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
      const response = await put<Form>(`/forms/${id}`, data);
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
});
