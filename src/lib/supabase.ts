import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xxwssmqegawhaxvnoktp.supabase.co";
const supabaseAnonKey = "sb_publishable_YRFGLZBbb0ghAfiD7fNyfQ_miVXWc7N";

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
