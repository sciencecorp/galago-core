import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`)
    .$onUpdate(() => sql`(datetime('now'))`),
};

// Logs table
export const logs = sqliteTable("logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  level: text("level").notNull(),
  action: text("action").notNull(),
  details: text("details").notNull(),
  ...timestamps,
});

// Export types
export type Log = typeof logs.$inferSelect;
export type NewLog = typeof logs.$inferInsert;

// Export all schemas as a single object
export const schema = {
  logs,
};
