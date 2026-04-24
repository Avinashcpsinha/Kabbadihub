import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ayuwvopuwqaqzenzwmee.supabase.co";
const supabaseAnonKey = "sb_publishable_nbIK2CXdNiPmNbmj-ROAuA_0b7iW6pD";

console.log("Supabase Init V3: Optimized Auth Options");

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'kabaddihub_auth_token_v3'
  }
});
