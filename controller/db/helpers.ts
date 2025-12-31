import { db } from "./client";
import { SQL } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

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
