import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABSE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_ANONE_PUB;

if (!supabaseKey || !supabaseUrl) {
  console.log("Supabase key and url not provided!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});

export default supabase;
