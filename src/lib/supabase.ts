import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xxwssmqegawhaxvnoktp.supabase.co";
const supabaseAnonKey = "sb_publishable_9l3X4EksyZlClYf1Pm0HeA_F8F6mbrz";

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
