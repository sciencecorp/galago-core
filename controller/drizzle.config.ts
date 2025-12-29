// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  dialect: "sqlite",
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dbCredentials: {
    url: "./data/app.db",
  },
} satisfies Config;
