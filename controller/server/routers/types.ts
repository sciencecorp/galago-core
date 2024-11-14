import { z } from "zod";

export const zAppSettings = z.object({
    id: z.number().optional(),
    name: z.string(),
    value: z.string(),
    is_active: z.boolean().optional(),
});