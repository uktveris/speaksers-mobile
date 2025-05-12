import { useState, useEffect } from "react";
import { View, Text, Image, Keyboard, Alert } from "react-native";
import { FontSizes, GlobalStyles } from "@/constants/StyleConstants";
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { getSupabaseClient } from "@/hooks/supabaseClient";
import { useSession } from "@/context/AuthContext";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { TextInput } from "react-native-paper";
import { Appearance } from "react-native";
import { KeyboardToolbar } from "react-native-keyboard-controller";
import { ImageBackground } from "react-native";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

const colorScheme = Appearance.getColorScheme();

function EditAccount() {
  const [changesMade, setChangesMade] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [originalName, setOriginalName] = useState("");
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState("");
  const { session } = useSession();
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!session) {
      console.log("no session, returning");
      return;
    }
    const fetchUser = async () => {
      const { data: userData, error } = await supabase
        .from("users")
        .select()
        .eq("id", session.user.id)
        .single();
      if (error) {
        console.log("error: " + (error as Error).message);
        return;
      }
      const { data: avatarData } = supabase.storage
        .from("avatars")
        .getPublicUrl(
          userData.avatar_url +
            "?updated_at=" +
            (userData.avatar_updated_at || Date.now()),
        );

      setUsername(userData.username ? userData.username : "username");
      setName(userData.name ? userData.name : "");
      setOriginalName(userData.name ? userData.name : "");
      setAvatarUrl(avatarData.publicUrl);
      setOriginalAvatarUrl(avatarData.publicUrl);
      setLoaded(true);
    };

    fetchUser();
  }, [session?.user]);

  const updateUserData = async () => {
    try {
      const extension = avatarUrl.split(".").pop()?.toLowerCase() || "jpg";
      const mimeType = "image/" + (extension === "jpg" ? "jpeg" : extension);
      const base64Data = await FileSystem.readAsStringAsync(avatarUrl, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const arrayBuffer = decode(base64Data);

      const filePath = "avatars/" + session?.user.id + "/avatar." + extension;
      console.log("arrayBuffer:", arrayBuffer);

      const { error: fileUploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, arrayBuffer, { upsert: true, contentType: mimeType });

      if (fileUploadError) {
        console.log("file upload error:", fileUploadError.message);
        return false;
      }

      const { data, error } = await supabase.from("users").upsert({
        id: session?.user.id,
        name: name,
        avatar_url: filePath,
        avatar_updated_at: new Date().toISOString(),
      });
      if (error) {
        console.log("error occurred while updating user:", error.message);
        return false;
      }
      console.log("success, updated data:", data);
      return true;
    } catch (err) {
      console.log("error:", (err as Error).message);
      return false;
    }
  };

  const updateUserAndGoBack = async () => {
    const result = await updateUserData();
    if (!result) {
      console.log("something went wrong when updating, returning..");
      return;
    }
    router.replace("/(protected)/(tabs)/account");
  };

  useEffect(() => {
    if (!loaded) {
      return;
    }
    const changed = name !== originalName || avatarUrl !== originalAvatarUrl;
    setChangesMade(changed);
  }, [loaded, name, avatarUrl, originalName, originalAvatarUrl]);

  const handleCancelGoBack = () => {
    if (!changesMade) {
      router.replace("/(protected)/(tabs)/account");
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
        onPress: () => router.replace("/(protected)/(tabs)/account"),
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
    }
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            onPress={handleCancelGoBack}
            style={GlobalStyles.secondaryButtonSmall}
          >
            <Text style={GlobalStyles.smallTextBold}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={() => updateUserAndGoBack()}
            style={GlobalStyles.primaryButtonSmall}
          >
            <Text style={GlobalStyles.smallTextBold}>Save</Text>
          </Pressable>
        </View>
        <View style={styles.outerContainer}>
          <View style={styles.infoContainer}>
            <ImageBackground source={{ uri: avatarUrl }} style={styles.image}>
              <Pressable onPress={pickImage} style={styles.userImage}>
                <View style={styles.editPictureText}>
                  <Text style={GlobalStyles.smallTextBold}>Edit</Text>
                </View>
              </Pressable>
            </ImageBackground>
            <View style={styles.userInfo}>
              <Text style={GlobalStyles.smallTextBold}>{username}</Text>
              <View style={GlobalStyles.verticalSpacerSmall} />
              <Text style={GlobalStyles.smallTextBold}>Edit name:</Text>
              <View style={GlobalStyles.verticalSpacerSmall} />
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
                textColor={
                  colorScheme === "light" ? Colors.light.text : Colors.dark.text
                }
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 5,
  },
  outerContainer: {
    width: "100%",
    padding: 10,
  },
  userInfo: {
    justifyContent: "center",
  },
  userImage: {
    alignItems: "center",
  },
  infoContainer: {
    width: "100%",
    backgroundColor: Colors.base.darkTint,
    padding: 10,
    borderRadius: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 40,
    overflow: "hidden",
    alignSelf: "center",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    width: "100%",
  },
  inputBox: {
    fontSize: FontSizes.small,
    backgroundColor: Colors.base.inputFieldBack,
    borderRadius: 10,
    color: colorScheme === "light" ? Colors.light.text : Colors.dark.text,
  },
  editPictureText: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 40,
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditAccount;
