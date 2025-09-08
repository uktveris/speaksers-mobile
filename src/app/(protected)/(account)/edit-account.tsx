import { useState, useEffect } from "react";
import { View, Text, Image, Keyboard, Alert } from "react-native";
import { StyleSheet } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/src/context/AuthContext";
import { Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { TextInput } from "react-native-paper";
import { Appearance } from "react-native";
import { KeyboardToolbar } from "react-native-keyboard-controller";
import { ImageBackground } from "react-native";
import { routerReplace, ROUTES } from "@/src/utils/navigation";
import { useUser } from "@/src/hooks/useUser";

const colorScheme = Appearance.getColorScheme();

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
  const {
    userData,
    avatarUrl: originalAvatarUrl,
    loading,
    updateUserData,
    refetch,
  } = useUser();

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
    const result = await updateUserData(avatarUrl, name);
    await refetch();
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
    const changed =
      name !== originalName || previewAvatarUrl !== originalAvatarUrl;
    setChangesMade(changed);
  }, [
    loaded,
    loading,
    name,
    previewAvatarUrl,
    originalName,
    originalAvatarUrl,
  ]);

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
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={handleCancelGoBack}>
            <Text>Cancel</Text>
          </Pressable>
          <Pressable onPress={() => updateUserAndGoBack()}>
            <Text>Save</Text>
          </Pressable>
        </View>
        <View style={styles.outerContainer}>
          <View style={styles.infoContainer}>
            <ImageBackground
              source={{ uri: previewAvatarUrl }}
              style={styles.image}
            >
              <Pressable onPress={pickImage} style={styles.userImage}>
                <View style={styles.editPictureText}>
                  <Text>Edit</Text>
                </View>
              </Pressable>
            </ImageBackground>
            <View style={styles.userInfo}>
              <Text>{username}</Text>
              <View />
              <Text>Edit name:</Text>
              <View />
              <TextInput
                style={styles.inputBox}
                theme={{ roundness: 10 }}
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
      </View>
      <KeyboardToolbar />
    </SafeAreaView>
  );
}
