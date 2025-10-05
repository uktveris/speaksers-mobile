import { useSession } from "@/src/context/AuthContext";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Image } from "react-native";
import { Text } from "react-native";
import { useUser } from "../hooks/useUser";
import { ActivityIndicator } from "react-native-paper";
import { theme } from "@/theme";
import { useColorScheme } from "nativewind";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { routerReplace, ROUTES } from "../utils/navigation";

function ProfileInfo() {
  const { session } = useSession();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const { userData, avatarUrl: originalAvatarUrl, loading } = useUser();
  const { colorScheme: c } = useColorScheme();

  useEffect(() => {
    if (!session || !userData) {
      console.log("no session, returning");
      return;
    }
    setUsername(userData.username ? userData.username : "no username");
    setName(userData.name ? userData.name : "no name");
  }, [session?.user, loading, originalAvatarUrl]);

  return (
    <View className="flex flex-row gap-5 py-3 items-center">
      <View className="overflow-hidden rounded-3xl">
        {loading && (
          <ActivityIndicator color={c === "light" ? theme.colors.text.light : theme.colors.text.dark} size="large" />
        )}
        {!loading && <Image className="w-32 h-32" source={{ uri: originalAvatarUrl || "" }} />}
      </View>
      <View>
        <Text className="text-text-light dark:text-text-dark text-sm">{username}</Text>
        <Text className="text-text-light dark:text-text-dark text-2xl font-bold">{name}</Text>
      </View>
      <View className="ml-auto">
        <Pressable onPress={() => routerReplace(ROUTES.editAccount)} className="p-4">
          <MaterialCommunityIcons
            name="account-edit"
            size={30}
            color={c === "light" ? theme.colors.text.light : theme.colors.text.dark}
          />
        </Pressable>
      </View>
    </View>
  );
}

export default ProfileInfo;
