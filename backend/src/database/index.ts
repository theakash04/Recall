import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.log("No supabase bd connection string provided")
  process.exit(1)
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle({ client })

export default db
