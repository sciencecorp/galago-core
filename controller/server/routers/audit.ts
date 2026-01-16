import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { appAuditEvents } from "@/db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";

export interface AuditEvent {
  id: number;
  actor: string;
  action: string;
  target_type: string;
  target_name?: string | null;
  details?: Record<string, any> | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export const auditRouter = router({
  getRecent: procedure
    .input(z.object({ limit: z.number().min(1).max(500).optional() }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit ?? 100;
      const rows = await db
        .select()
        .from(appAuditEvents)
        .orderBy(desc(appAuditEvents.id))
        .limit(limit);
      return rows.map(
        (r): AuditEvent => ({
          id: r.id,
          actor: r.actor,
          action: r.action,
          target_type: r.targetType,
          target_name: r.targetName ?? null,
          details: (r.details as any) ?? null,
          created_at: r.createdAt ?? null,
          updated_at: r.updatedAt ?? null,
        }),
      );
    }),
});
