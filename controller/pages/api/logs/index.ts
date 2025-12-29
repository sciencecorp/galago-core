// pages/api/logs.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db/client";
import { logs } from "@/db/schema";
import { desc, asc, eq, and } from "drizzle-orm";
import { z } from "zod";

const LogCreateSchema = z.object({
  level: z.string().min(1),
  action: z.string().min(1),
  details: z.string().min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const {
        skip = "0",
        limit = "100",
        order_by = "createdAt",
        descending = "false",
        level,
        action,
      } = req.query;

      let query = db.select().from(logs);

      // Apply filters
      const conditions = [];
      if (level) conditions.push(eq(logs.level, level as string));
      if (action) conditions.push(eq(logs.action, action as string));
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Apply ordering
      const orderCol = logs[order_by as keyof typeof logs];
      query = query.orderBy(descending === "true" ? desc(orderCol) : asc(orderCol));

      // Pagination
      const result = await query.limit(parseInt(limit as string)).offset(parseInt(skip as string));

      return res.status(200).json(result);
    }

    if (req.method === "POST") {
      const validated = LogCreateSchema.parse(req.body);
      const result = await db.insert(logs).values(validated).returning();
      return res.status(201).json(result[0]);
    }

    if (req.method === "DELETE") {
      await db.delete(logs);
      return res.status(200).json({ message: "All logs cleared" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
    }
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
