import { db } from "@/db/client";
import { logs } from "@/db/schema";

export const logAction = async (log: { level: string; action: string; details: string }) => {
  try {
    await db.insert(logs).values(log);
  } catch (error) {
    console.error("Failed to log action:", error);
  }
};
