import { defineConfig } from "drizzle-kit";
import path from "path";

// DATABASE_URL is optional now

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "sqlite.db",
  },
});
