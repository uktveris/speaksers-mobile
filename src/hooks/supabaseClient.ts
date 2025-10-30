import { AppState } from "react-native";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

let client: SupabaseClient | null = null;
let appStateListener: ReturnType<typeof AppState.addEventListener> | null = null;

function initialize() {
  if (client) {
    return client;
  }
  const url = Constants.expoConfig?.extra?.SUPABASE_URL as string;
  const key = Constants.expoConfig?.extra?.SUPABASE_PUBLISHABLE_KEY as string;

  if (!url || !key) {
    console.log("Supabase URL and key must be provided in app.config.js extra fields");
  }

  client = createClient(url, key, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // detectSessionInUrl: false,
    },
  });

  console.log("initialized supabase client");

  if (appStateListener) {
    appStateListener.remove();
  }

  appStateListener = AppState.addEventListener("change", (state) => {
    if (client) {
      if (state === "active") {
        client.auth.startAutoRefresh();
      } else {
        client.auth.stopAutoRefresh();
      }
    }
  });

  return client;
}

export function getSupabaseClient() {
  if (!client) {
    return initialize();
  }
  return client;
}
