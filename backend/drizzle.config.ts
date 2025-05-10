import { defineConfig } from "drizzle-kit"

const psqlURL = process.env.SUPABASE_DB_URL;

if (!psqlURL) {
  console.log("PSQL url not provided!")
  process.exit(1);
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  dbCredentials: {
    url: psqlURL,
  }
})
