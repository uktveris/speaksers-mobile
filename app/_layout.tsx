import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Slot, Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getSupabaseClient } from "@/hooks/supabaseClient";
import { SessionProvider } from "@/context/AuthContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(app)/(tabs)/index",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  return (
    <SessionProvider>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            {loaded ? <Slot /> : null}
            <StatusBar style="auto" />
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </SessionProvider>
  );
}
