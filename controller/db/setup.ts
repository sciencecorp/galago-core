import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export function setupDatabase() {
  try {
    console.log("🔄 Syncing database schema...");

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log("📁 Created data directory");
    }

    // Run drizzle-kit push SYNCHRONOUSLY to block until complete
    execSync("npx drizzle-kit push", {
      env: { ...process.env, DRIZZLE_KIT_ACCEPT_ALL: "1" },
      stdio: "inherit",
    });
    console.log("✅ Database schema synced");
  } catch (error) {
    console.error("❌ Database sync failed:", error);
    throw error;
  }
}
