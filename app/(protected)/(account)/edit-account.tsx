import { useState, useEffect } from "react";
import { View, Text, Image, Keyboard } from "react-native";
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

const colorScheme = Appearance.getColorScheme();

function EditAccount() {
  const [changesMade, setChangesMade] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseClient();
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
        .getPublicUrl(userData.avatar_url);

      setUsername(userData.username ? userData.username : "username");
      setName(userData.name ? userData.name : "name");
      setAvatarUrl(avatarData.publicUrl);
    };

    fetchUser();
  }, [session?.user]);

  const handleCancelGoBack = () => {
    router.replace("/(protected)/(tabs)/account");
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
            onPress={handleCancelGoBack}
            style={GlobalStyles.primaryButtonSmall}
          >
            <Text style={GlobalStyles.smallTextBold}>Save</Text>
          </Pressable>
        </View>
        <View style={styles.outerContainer}>
          <View style={styles.infoContainer}>
            <Pressable onPress={pickImage} style={styles.userImage}>
              <Image
                source={{ uri: avatarUrl as string }}
                style={styles.image}
              />
            </Pressable>
            <View style={styles.userInfo}>
              <Text style={GlobalStyles.smallTextBold}>{username}</Text>
              <Text style={GlobalStyles.smallTextBold}>Edit name:</Text>
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
              />
            </View>
          </View>
        </View>
      </View>
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
    paddingVertical: 10,
    borderRadius: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 40,
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
});

export default EditAccount;
