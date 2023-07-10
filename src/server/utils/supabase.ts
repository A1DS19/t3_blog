import { env } from "@/env.mjs";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(env.SUPABASE_PUBLIC_URL, env.SUPABASE_KEY);
