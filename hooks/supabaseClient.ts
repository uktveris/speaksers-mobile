import { AppState } from "react-native";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const url = Constants.expoConfig?.extra?.SUPABASE_AUTH_URL as string;
const key = Constants.expoConfig?.extra?.SUPABASE_AUTH_API_KEY as string;

// including localStorage for debuging in web

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
