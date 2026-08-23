import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL or key missing in .env file."
  );
}

/*
  CUSTOMER SUPABASE CLIENT

  Website customer login / Google login /
  customer account-ku mattum use pannuvom.

  Admin session idhoda mix aaga koodadhu.
*/
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,

      autoRefreshToken: true,

      detectSessionInUrl: true,

      /*
        Customer-ku separate storage key.

        Admin client:
        vv-sarees-admin-auth

        Customer client:
        vv-sarees-customer-auth
      */
      storageKey:
        "vv-sarees-customer-auth",
    },
  }
);