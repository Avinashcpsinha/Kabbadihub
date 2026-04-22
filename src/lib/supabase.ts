import { createClient } from "@supabase/supabase-js";

// Hardcoded for Vercel deployment (These are public frontend keys, safe to expose)
const supabaseUrl = "https://ayuwvopuwqaqzenzwmee.supabase.co";
const supabaseAnonKey = "sb_publishable_nbIK2CXdNiPmNbmj-ROAuA_0b7iW6pD";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
