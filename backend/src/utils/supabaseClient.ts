import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABSE_PROJECT_URL || "";
const supabaseKey = process.env.SUPABASE_ANONE_PUB || "";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: false,
    flowType: 'pkce',
  }
});

export default supabase;
