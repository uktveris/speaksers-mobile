import "react-native-reanimated";
import "@/global.css";
import { useFonts } from "expo-font";
import { Slot, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import * as Updates from "expo-updates";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider } from "@/src/context/AuthContext";
import { deactivateKeepAwake } from "expo-keep-awake";
import { LocaleProvider } from "@/src/context/LocaleContext";
import { setRouterInstance } from "../utils/navigation";
import { ModalProvider } from "../context/ModalContext";
import { NetworkProvider } from "../context/NetworkContext";
import OfflineBanner from "../components/ui/OfflineBanner";
import { useColorScheme } from "nativewind";
import { getItem } from "../utils/storage";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 400,
  fade: true,
});

export const unstable_settings = {
  initialRouteName: "(app)/(tabs)/index",
};

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    const loadTheme = async () => {
      const theme = await getItem("theme");
      if (!theme) {
        console.log("no theme item found, setting system theme");
        setColorScheme("system");
        return;
      }
      setColorScheme(theme as "light" | "dark");
    };
    loadTheme();
  }, []);

  useEffect(() => {
    deactivateKeepAwake();
  }, []);

  useEffect(() => {
    setRouterInstance(router);
  }, [router]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  return (
    <SessionProvider>
      <SafeAreaProvider>
        <NetworkProvider>
          <KeyboardProvider>
            <ModalProvider>
              <LocaleProvider>
                <OfflineBanner />
                {loaded ? <Slot /> : null}
                <StatusBar style="auto" />
              </LocaleProvider>
            </ModalProvider>
          </KeyboardProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </SessionProvider>
  );
}
