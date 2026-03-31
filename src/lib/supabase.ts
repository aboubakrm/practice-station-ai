import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xxwssmqegawhaxvnoktp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4d3NzbXFlZ2F3aGF4dm5va3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTAwNjQsImV4cCI6MjA5MDUyNjA2NH0.X9UdmqYLTW06WeV0uNOk1Ki96bT0yUpyyG6qZ8e7bVM";

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
