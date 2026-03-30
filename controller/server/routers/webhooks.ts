import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { webhooks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { logAuditEvent } from "@/server/utils/auditLog";

export const webhooksRouter = router({
  list: procedure.query(async () => {
    return db.select().from(webhooks);
  }),

  create: procedure
    .input(
      z.object({
        name: z.string().min(1),
        url: z.string().url(),
        toolTypes: z.array(z.string()).nullable().optional(),
        commands: z.array(z.string()).nullable().optional(),
        includeData: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const created = await db
        .insert(webhooks)
        .values({
          name: input.name,
          url: input.url,
          toolTypes: input.toolTypes ?? null,
          commands: input.commands ?? null,
          includeData: input.includeData ?? true,
          isActive: input.isActive ?? true,
        })
        .returning();

      await logAuditEvent({
        actor: "user",
        action: "webhooks.create",
        targetType: "webhook",
        targetName: input.name,
        details: { url: input.url },
      });

      return created[0];
    }),

  update: procedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        url: z.string().url().optional(),
        toolTypes: z.array(z.string()).nullable().optional(),
        commands: z.array(z.string()).nullable().optional(),
        includeData: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const updated = await db
        .update(webhooks)
        .set(updates)
        .where(eq(webhooks.id, id))
        .returning();

      await logAuditEvent({
        actor: "user",
        action: "webhooks.update",
        targetType: "webhook",
        details: { id, ...updates },
      });

      return updated[0];
    }),

  delete: procedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(webhooks).where(eq(webhooks.id, input.id));

      await logAuditEvent({
        actor: "user",
        action: "webhooks.delete",
        targetType: "webhook",
        details: { id: input.id },
      });
    }),
});
