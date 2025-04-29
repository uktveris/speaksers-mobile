import { GlobalStyles } from "@/constants/StyleConstants";
import { getSupabaseClient } from "@/hooks/supabaseClient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text } from "react-native";
import { View } from "react-native";
import * as Linking from "expo-linking";

export default function AuthCallback() {
  const router = useRouter();

  const extractParams = (url: string) => {
    const fragment = url.split("#")[1];
    if (!fragment) {
      return { accessToken: null, refreshToken: null };
    }
    const params = fragment.split("&").reduce((result, param) => {
      const [key, value] = param.split("=");
      result[key] = value;
      return result;
    }, {});

    return {
      accessToken: params.access_token || null,
      refreshToken: params.refresh_token || null,
    };
  };

  useEffect(() => {
    const supabase = getSupabaseClient();
    const handleUrl = async (url: string | null) => {
      if (!url) {
        return;
      }
      const tokens = extractParams(url);
      if (!tokens.accessToken || !tokens.refreshToken) {
        return;
      }
      const access = tokens.accessToken as string;
      const refresh = tokens.refreshToken as string;
      const { error } = await supabase.auth.setSession({
        access_token: access,
        refresh_token: refresh,
      });

      if (error) {
        console.log("error while setting session: " + error.message);
        router.replace("/login");
        return;
      }
      router.replace("/(protected)/(tabs)");
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener("url", (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return <View style={GlobalStyles.container}></View>;
}
