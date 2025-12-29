// db/client.ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

// Only run on server
if (typeof window === "undefined") {
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log("📁 Created data directory");
  }

  try {
    console.log("🔄 Syncing database schema...");
    execSync("npx drizzle-kit push", {
      env: { ...process.env, DRIZZLE_KIT_ACCEPT_ALL: "1" },
      stdio: "inherit",
    });
    console.log("✅ Database schema synced");
  } catch (error) {
    console.error("❌ Database sync failed:", error);
  }
}

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "app.db");
const sqlite = new Database(dbPath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { sqlite };

console.log("📊 Database connected:", dbPath);
