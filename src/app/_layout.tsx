import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Slot, Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import "react-native-reanimated";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { useColorScheme } from "@/src/hooks/useColorScheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider } from "@/src/context/AuthContext";
import { deactivateKeepAwake } from "expo-keep-awake";
import { AppState } from "react-native";
import { LocaleProvider } from "@/src/context/LocaleContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(app)/(tabs)/index",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const appState = useRef(AppState.currentState);
  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    deactivateKeepAwake();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  return (
    <SessionProvider>
      <SafeAreaProvider>
        <KeyboardProvider>
          <LocaleProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              {loaded ? <Slot /> : null}
              <StatusBar style="auto" />
            </ThemeProvider>
          </LocaleProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </SessionProvider>
  );
}
