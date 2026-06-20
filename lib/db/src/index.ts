import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import path from "path";

const dbPath = process.env.DATABASE_URL || `file:${path.resolve(process.cwd(), "sqlite.db")}`;
export const sqlite = createClient({ url: dbPath });
export const db = drizzle(sqlite, { schema });

export * from "./schema";
