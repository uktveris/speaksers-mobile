import { useState, useEffect } from "react";
import { View, Text, Image, Keyboard, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/src/context/AuthContext";
import { Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { TextInput } from "react-native-paper";
import { ActivityIndicator } from "react-native";
import { KeyboardToolbar } from "react-native-keyboard-controller";
import { ImageBackground } from "react-native";
import { routerReplace, ROUTES } from "@/src/utils/navigation";
import { useUser } from "@/src/hooks/useUser";
import { useColorScheme } from "nativewind";
import { theme } from "@/theme";

export default function EditAccount() {
  const [changesMade, setChangesMade] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [loaded, setLoaded] = useState(false);
  const { session } = useSession();
  const [updateLoading, setUpdateLoading] = useState(false);
  const { userData, avatarUrl: originalAvatarUrl, loading, updateUserData, refetch } = useUser();
  const c = useColorScheme();
  const textCol = c.colorScheme === "light" ? theme.colors.text.light : theme.colors.text.dark;

  useEffect(() => {
    if (!session || !userData) {
      console.log("no session or loading user data, returning..");
      return;
    }

    setOriginalName(userData.name);
    setOriginalUsername(userData.username);
    setUsername(userData.username);
    setName(userData.name);
    setPreviewAvatarUrl(originalAvatarUrl);
    setLoaded(true);
  }, [session?.user, userData, originalAvatarUrl]);

  const updateUserAndGoBack = async () => {
    setUpdateLoading(true);
    const result = await updateUserData(avatarUrl, name);
    await refetch();
    setUpdateLoading(false);
    if (!result) {
      console.log("something went wrong when updating, returning..");
      return;
    }
    routerReplace(ROUTES.accountTab);
  };

  useEffect(() => {
    if (!loaded || !userData || loading) {
      return;
    }
    const changed = name !== originalName || previewAvatarUrl !== originalAvatarUrl;
    setChangesMade(changed);
  }, [loaded, loading, name, previewAvatarUrl, originalName, originalAvatarUrl]);

  const handleCancelGoBack = () => {
    if (!changesMade) {
      routerReplace(ROUTES.accountTab);
      return;
    }
    Alert.alert("Unsaved changes", "The changes will be cancelled.", [
      {
        text: "Keep editing",
        onPress: () => console.log("choice: keep editing the page"),
        style: "default",
      },
      {
        text: "Cancel changes",
        onPress: () => routerReplace(ROUTES.accountTab),
        style: "cancel",
      },
    ]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
    });
    console.log(result);

    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri);
      setPreviewAvatarUrl(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView className="h-full bg-background-light dark:bg-background-dark">
      <View className="flex-1 px-2">
        <View className="flex flex-row justify-between">
          <Pressable
            className="bg-contrast-light dark:bg-contrast-dark py-1 px-6 rounded-3xl"
            onPress={handleCancelGoBack}
          >
            <Text className="text-text-dark dark:text-text-light font-bold text-xl">Cancel</Text>
          </Pressable>
          <Pressable className="bg-primary py-1 px-6 rounded-3xl" onPress={() => updateUserAndGoBack()}>
            {!updateLoading && <Text className="text-text-dark font-bold text-xl">Save</Text>}
            {updateLoading && <ActivityIndicator color={theme.colors.text.dark} />}
          </Pressable>
        </View>
        <View className="pt-3">
          <View className=" flex items-center">
            <View className="rounded-full overflow-hidden">
              {loading && (
                <ActivityIndicator
                  color={c.colorScheme === "light" ? theme.colors.text.light : theme.colors.text.dark}
                  size="large"
                />
              )}
              {!loading && (
                <ImageBackground source={{ uri: previewAvatarUrl! }} className="w-32 h-32">
                  <Pressable onPress={pickImage} className="flex-1 items-center justify-center bg-black/70">
                    <View>
                      <Text className="text-contrast-dark font-bold">Edit</Text>
                    </View>
                  </Pressable>
                </ImageBackground>
              )}
            </View>
          </View>
          <View className="pt-3">
            <Text className="text-text-light dark:text-text-dark self-center">{username}</Text>
            <Text className="text-text-light dark:text-text-dark text-xl font-bold">Edit name:</Text>
            <TextInput
              textColor={textCol}
              className="rounded-3xl bg-black/25 w-full my-1"
              style={{ backgroundColor: "transparent" }}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              onChangeText={setName}
              value={name}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              placeholderTextColor="grey"
              placeholder="Type display name"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
