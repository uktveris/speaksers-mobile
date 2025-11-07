import { getSupabaseClient } from "@/src/hooks/supabaseClient";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import * as Linking from "expo-linking";
import { routerReplace, ROUTES } from "../../utils/navigation";
import { useColorScheme } from "nativewind";
import { theme } from "@/theme";

export default function AuthCallback() {
  console.log("REACHED AUTH CALLBACK");
  const [loading, setLoading] = useState(false);
  const processedRef = useRef(false);
  const { colorScheme: c } = useColorScheme();

  useEffect(() => {
    const supabase = getSupabaseClient();

    const extractParams = (url: string) => {
      try {
        const parsed = Linking.parse(url);
        const params = parsed.queryParams;

        console.log("params:", { params });

        if (!params) {
          throw new Error("No parameters found");
        }
        const accessToken = params.access_token;
        const refreshToken = params.refresh_token;

        if (!accessToken || !refreshToken) {
          throw new Error("Missing access or refresh token");
        }

        return {
          accessToken: Array.isArray(accessToken) ? accessToken[0] : accessToken,
          refreshToken: Array.isArray(refreshToken) ? refreshToken[0] : refreshToken,
          error: null,
        };
      } catch (error) {
        console.log("encountered error while parsing params:", error);
        return {
          accessToken: null,
          refreshToken: null,
          error: error as Error,
        };
      }
    };

    const handleUrl = async (url: string | null) => {
      if (processedRef.current) {
        console.log("already processed auth callback; ignoring");
        return;
      }
      processedRef.current = true;
      setLoading(true);

      console.log("received url:", url);
      if (!url) {
        Alert.alert("Error", "URL error, try to log in manually");
        routerReplace(ROUTES.login);
        return;
      }

      try {
        const e = extractParams(url);
        if (e.error) {
          throw e.error;
        }
        const { error } = await supabase.auth.setSession({
          access_token: e.accessToken,
          refresh_token: e.refreshToken,
        });
        if (error) throw error;

        routerReplace(ROUTES.homeScreen);
      } catch (error) {
        console.log("auth callback error:", error);
        Alert.alert("Authentication Error", error instanceof Error ? error.message : "Failed to sign in", [
          { text: "OK" },
        ]);
        routerReplace(ROUTES.login);
      } finally {
        setLoading(false);
      }
    };

    Linking.getInitialURL().then(handleUrl);

    const subscription = Linking.addEventListener("url", (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={c === "light" ? theme.colors.text.light : theme.colors.text.dark} size="large" />
      </View>
    );
  }
  return <View />;
}
