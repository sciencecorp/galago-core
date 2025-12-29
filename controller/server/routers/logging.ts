import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { logs } from "@/db/schema";
import { desc, asc, eq, and, sql } from "drizzle-orm";

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
        orderBy: z.enum(["id", "level", "action", "createdAt", "updatedAt"]).default("createdAt"),
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

      let query = db.select().from(logs);

      // Apply filters
      if (filters) {
        const conditions = [];
        if (filters.level) {
          conditions.push(eq(logs.level, filters.level));
        }
        if (filters.action) {
          conditions.push(eq(logs.action, filters.action));
        }
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }

      // Apply ordering
      const orderCol = logs[orderBy];
      query = query.orderBy(descending ? desc(orderCol) : asc(orderCol));

      // Apply pagination
      const result = await query.limit(limit).offset(skip);

      return result;
    }),

  // NEW: Add count query
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

      let query = db.select({ count: sql<number>`count(*)` }).from(logs);

      // Apply same filters as getPaginated
      if (filters) {
        const conditions = [];
        if (filters.level) {
          conditions.push(eq(logs.level, filters.level));
        }
        if (filters.action) {
          conditions.push(eq(logs.action, filters.action));
        }
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }

      const result = await query;
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
