import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.log("no connection string provided!");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
