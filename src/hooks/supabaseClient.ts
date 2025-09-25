import { AppState } from "react-native";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const url = Constants.expoConfig?.extra?.SUPABASE_URL as string;
const key = Constants.expoConfig?.extra?.SUPABASE_PUBLISHABLE_KEY as string;

const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener("change", (state) => {
  state === "active"
    ? supabase.auth.startAutoRefresh()
    : supabase.auth.stopAutoRefresh();
});

export function getSupabaseClient() {
  return supabase;
}
