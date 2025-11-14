import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import { getSupabaseClient } from "@/src/hooks/supabaseClient";
import GameBox from "@/src/components/GameBox";
import { routerReplace, ROUTES } from "@/src/utils/navigation";
import { useLinkingURL } from "expo-linking";
import { theme } from "@/theme";
import { Text } from "react-native";
import { BottomModal } from "@/src/components/ui/BottomModal";
import { useGlobalModal } from "@/src/context/ModalContext";
import { useUser } from "@/src/hooks/useUser";
import { useEffect, useState } from "react";

export default function App() {
  const supabase = getSupabaseClient();
  const { userData } = useUser();
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(userData?.username);
  });

  const createSessionFromUrl = async (url: string) => {
    const { params, errorCode } = QueryParams.getQueryParams(url);
    if (errorCode) {
      throw new Error(errorCode);
    }

    const { accessToken, refreshToken } = params;
    if (!accessToken) {
      return;
    }
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) {
      console.log("ERROR: " + error.message);
    }
    routerReplace(ROUTES.homeScreen);
    return data.session;
  };

  // const url = Linking.useURL();
  const url = useLinkingURL();
  if (url) {
    createSessionFromUrl(url);
  }

  const { showModal, hideModal } = useGlobalModal();

  return (
    <SafeAreaView className="h-full bg-background-light dark:bg-background-dark">
      <View className="flex-1 px-2">
        <View className="py-8 px-2">
          <Text className="text-text-light dark:text-text-dark text-4xl font-bold">Hi, {username}</Text>
        </View>
        <Grid>
          <GameBox backgroundColor={theme.colors.primary} name="Start Dialog" link={ROUTES.dialog} />
          {/*<Pressable
            onPress={() =>
              showModal(
                <>
                  <Text>Modal</Text>
                  <Pressable onPress={hideModal}>
                    <Text>Hide</Text>
                  </Pressable>
                </>,
              )
            }
          >
            <Text className="text-text-light dark:text-text-dark mt-5">Open Modal</Text>
          </Pressable>*/}
        </Grid>
      </View>
    </SafeAreaView>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <View className="flex-1">{children}</View>;
}
