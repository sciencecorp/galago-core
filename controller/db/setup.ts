import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export function setupDatabase() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    // Run drizzle-kit push SYNCHRONOUSLY to block until complete
    execSync("npx drizzle-kit push", {
      env: { ...process.env, DRIZZLE_KIT_ACCEPT_ALL: "1" },
      stdio: "inherit",
    });
  } catch (error) {
    console.error("❌ Database sync failed:", error);
    throw error;
  }
}
