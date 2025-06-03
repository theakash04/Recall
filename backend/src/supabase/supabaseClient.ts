import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABSE_PROJECT_URL;
// const supabaseKey = process.env.SUPABASE_ANONE_PUB;
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseAdminKey || !supabaseUrl) {
  console.log("Supabase key and url not provided!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAdminKey, {
  auth: {
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});

export default supabase;
