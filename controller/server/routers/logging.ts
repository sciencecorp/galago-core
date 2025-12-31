// server/routers/logging.ts
import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { logs } from "@/db/schema";
import { desc, asc, eq, and, sql, like } from "drizzle-orm";

const LogCreateSchema = z.object({
  level: z.string().min(1),
  action: z.string().min(1),
  details: z.string().min(1),
});

export const loggingRouter = router({
  getAll: procedure.query(async () => {
    const result = await db.select().from(logs).orderBy(desc(logs.createdAt));
    return result;
  }),

  getPaginated: procedure
    .input(
      z.object({
        skip: z.number().default(0),
        limit: z.number().default(100),
        descending: z.boolean().default(false),
        orderBy: z
          .enum(["id", "level", "action", "created_at", "updated_at"])
          .default("created_at"),
        filters: z
          .object({
            level: z.string().optional(),
            action: z.string().optional(),
          })
          .optional(),
      }),
    )
    .query(async ({ input }) => {
      const { skip, limit, descending, orderBy, filters } = input;

      // Build conditions array
      const conditions = [];
      if (filters?.level) {
        conditions.push(eq(logs.level, filters.level));
      }
      if (filters?.action) {
        conditions.push(like(logs.action, `%${filters.action}%`));
      }

      // Build query with conditions
      const query =
        conditions.length > 0
          ? db
              .select()
              .from(logs)
              .where(and(...conditions))
          : db.select().from(logs);

      const orderCol = logs[orderBy];
      const orderedQuery = query.orderBy(descending ? desc(orderCol) : asc(orderCol));
      const result = await orderedQuery.limit(limit).offset(skip);
      return result;
    }),

  count: procedure
    .input(
      z.object({
        filters: z
          .object({
            level: z.string().optional(),
            action: z.string().optional(),
          })
          .optional(),
      }),
    )
    .query(async ({ input }) => {
      const { filters } = input;

      const conditions = [];
      if (filters?.level) {
        conditions.push(eq(logs.level, filters.level));
      }
      if (filters?.action) {
        conditions.push(like(logs.action, `%${filters.action}%`));
      }

      const countQuery =
        conditions.length > 0
          ? db
              .select({ count: sql<number>`count(*)` })
              .from(logs)
              .where(and(...conditions))
          : db.select({ count: sql<number>`count(*)` }).from(logs);

      const result = await countQuery;
      return result[0].count;
    }),

  add: procedure.input(LogCreateSchema).mutation(async ({ input }) => {
    const result = await db.insert(logs).values(input).returning();
    return result[0];
  }),

  clearAll: procedure.mutation(async () => {
    await db.delete(logs);
    return { message: "Logs cleared successfully" };
  }),
});
