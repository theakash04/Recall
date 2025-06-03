import { defineConfig } from "drizzle-kit";
import process from "node:process";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schema.ts",
  out: "./drizzle",
  breakpoints: true,
  dbCredentials: {
    url: process.env.SUPABASE_DB_URL || "",
  },
});
