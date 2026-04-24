import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ayuwvopuwqaqzenzwmee.supabase.co";
const supabaseAnonKey = "sb_publishable_nbIK2CXdNiPmNbmj-ROAuA_0b7iW6pD";

console.log("Supabase Init V2: Hardcoded Publishable Key Used");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
