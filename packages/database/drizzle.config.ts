import { Config } from "drizzle-kit";
import process from "node:process";
import dotenv from "dotenv";

dotenv.config();

export default {
  dialect: "postgresql",
  schema: "./schema.ts",
  out: "./drizzle",
  breakpoints: true,
  dbCredentials: {
    url: process.env.SUPABASE_DB_URL || "",
  },
} satisfies Config;
