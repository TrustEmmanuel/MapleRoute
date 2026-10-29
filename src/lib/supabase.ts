import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const rawUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? "").trim();
const anonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

function normalizeUrl(value: string) {
  return value.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

export const supabaseUrl = normalizeUrl(rawUrl);
export const supabaseAnonKey = anonKey;
export const isSupabaseConfigured = supabaseUrl.length > 0 && anonKey.length > 0;

function createSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;

  try {
    // Web keeps the session in the browser. Native sessions will move to
    // expo-secure-store when the mobile build is wired up.
    return createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: Platform.OS === "web",
        autoRefreshToken: true,
        detectSessionInUrl: Platform.OS === "web",
        flowType: "pkce",
      },
    });
  } catch {
    return null;
  }
}

export const supabase = createSupabaseClient();

export function getSupabaseHost(): string | null {
  if (!isSupabaseConfigured) return null;

  try {
    return new URL(supabaseUrl).host;
  } catch {
    return supabaseUrl.replace(/^https?:\/\//, "");
  }
}
