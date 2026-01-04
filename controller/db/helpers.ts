import { db } from "./client";
import { SQL, eq } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";
import { workcells, appSettings } from "@/db/schema";
import { TRPCError } from "@trpc/server";
/**
 * Find a single record by condition, return undefined if not found
 * More ergonomic than checking array length
 */
export async function findOne<T extends SQLiteTable>(
  table: T,
  where: SQL,
): Promise<any | undefined> {
  const result = await db.select().from(table).where(where).limit(1);

  return result[0];
}

/**
 * Find a single record by condition, throw if not found
 */
export async function findOneOrFail<T extends SQLiteTable>(
  table: T,
  where: SQL,
  errorMessage = "Record not found",
): Promise<any> {
  const result = await findOne(table, where);

  if (!result) {
    throw new Error(errorMessage);
  }

  return result;
}

/**
 * Find all records matching condition
 */
export async function findMany<T extends SQLiteTable>(table: T, where?: SQL): Promise<any[]> {
  let query = db.select().from(table);

  if (where) {
    query = query.where(where) as any;
  }

  return await query;
}

/**
 * Check if a record exists
 */
export async function exists<T extends SQLiteTable>(table: T, where: SQL): Promise<boolean> {
  const result = await findOne(table, where);
  return !!result;
}

/**
 * Count records matching condition
 */
export async function count<T extends SQLiteTable>(table: T, where?: SQL): Promise<number> {
  const result = await findMany(table, where);
  return result.length;
}

export async function getSelectedWorkcellId(): Promise<number> {
  const setting = await findOne(appSettings, eq(appSettings.name, "workcell"));

  if (!setting || !setting.isActive) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No workcell is currently selected. Please select a workcell to use this feature.",
    });
  }

  const workcell = await findOne(workcells, eq(workcells.name, setting.value));

  if (!workcell) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Selected workcell '${setting.value}' not found`,
    });
  }

  return workcell.id;
}

export const INVENTORY_TOOL_MAP: Record<string, { rows: number; columns: number }> = {
  alps: { rows: 1, columns: 1 },
  bioshake: { rows: 1, columns: 1 },
  bravo: { rows: 3, columns: 3 },
  cytation: { rows: 1, columns: 1 },
  hamilton: { rows: 5, columns: 11 },
  hig_centrifuge: { rows: 2, columns: 1 },
  liconic: { rows: 10, columns: 5 },
  microserve: { rows: 50, columns: 14 },
  opentrons2: { rows: 4, columns: 3 },
  plateloc: { rows: 1, columns: 1 },
  spectramax: { rows: 1, columns: 1 },
  vcode: { rows: 1, columns: 1 },
  vprep: { rows: 3, columns: 2 },
  xpeel: { rows: 1, columns: 1 },
};
