// db/client.ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// Only run on server
if (typeof window === "undefined") {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log("📁 Created data directory");
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

// Run migrations automatically when db client is imported
if (typeof window === "undefined") {
  try {
    console.log("🔄 Running database migrations...");

    // Absolute path to migrations folder
    const migrationsFolder = path.join(process.cwd(), "db", "migrations");

    // Debug: log the path and check if files exist
    console.log(`Migrations folder: ${migrationsFolder}`);
    const journalPath = path.join(migrationsFolder, "meta", "_journal.json");
    console.log(`Journal exists: ${fs.existsSync(journalPath)}`);

    migrate(db, { migrationsFolder });
    console.log("✅ Database migrations complete");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.error("Current working directory:", process.cwd());
    throw error;
  }
}

console.log("📊 Database connected:", dbPath);
