import { getSupabaseClient } from "@/src/hooks/supabaseClient";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import * as Linking from "expo-linking";
import { routerReplace, ROUTES } from "../../utils/navigation";
import { useColorScheme } from "nativewind";
import { theme } from "@/theme";

export default function AuthCallback() {
  const [loading, setLoading] = useState(false);
  const [processed, setProcessed] = useState(false);
  const { colorScheme: c } = useColorScheme();

  useEffect(() => {
    const supabase = getSupabaseClient();

    const handleUrl = async (url: string | null) => {
      if (processed) return;
      setProcessed(true);
      setLoading(true);

      if (!url) {
        Alert.alert("Error", "URL error, try to log in manually");
        routerReplace(ROUTES.login);
        return;
      }

      try {
        const parsed = Linking.parse(url);
        const params = parsed.queryParams;

        const fragment = url.split("#")[1];
        if (!fragment) {
          throw new Error("No authentication data found");
        }

        const fragmentParams = new URLSearchParams(fragment);
        const accessToken = fragmentParams.get("access_token");
        const refreshToken = fragmentParams.get("refresh_token");

        if (!accessToken || !refreshToken) {
          throw new Error("Missing authentication tokens");
        }

        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });

        if (error) throw error;

        routerReplace(ROUTES.homeScreen);
      } catch (error) {
        console.log("auth callback error:", error);
        Alert.alert("Authentication Error", error instanceof Error ? error.message : "Failed to sign in", [
          { text: "OK" },
        ]);
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
  }, [processed]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={c === "light" ? theme.colors.text.light : theme.colors.text.dark} size="large" />
      </View>
    );
  }
  return <View />;
}
