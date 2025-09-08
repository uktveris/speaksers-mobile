import { getSupabaseClient } from "@/src/hooks/supabaseClient";
import { useEffect } from "react";
import { Text } from "react-native";
import { View } from "react-native";
import * as Linking from "expo-linking";
import { routerReplace, ROUTES } from "../utils/navigation";

export default function AuthCallback() {
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
        routerReplace(ROUTES.login);
        return;
      }
      routerReplace(ROUTES.homeScreen);
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener("url", (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return <View></View>;
}
