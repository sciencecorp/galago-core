import { procedure, router } from "@/server/trpc";
import { get } from "@/server/utils/api";
import { z } from "zod";

export interface AuditEvent {
  id: number;
  actor: string;
  action: string;
  target_type: string;
  target_name?: string | null;
  details?: Record<string, any> | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export const auditRouter = router({
  getRecent: procedure
    .input(z.object({ limit: z.number().min(1).max(500).optional() }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit ?? 100;
      return await get<AuditEvent[]>(`/audit?limit=${limit}`);
    }),
});
