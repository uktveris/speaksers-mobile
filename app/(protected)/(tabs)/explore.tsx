import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { StyleSheet } from "react-native";
import { Pressable } from "react-native";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import axiosConfig from "@/config/axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getBackendUrl } from "@/config/urlConfig";
import { useSession } from "@/context/AuthContext";
import { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/hooks/supabaseClient";

function Explore() {
  const router = useRouter();
  const { signOut, session } = useSession();

  const handleSignOut = async () => {
    signOut();
    router.replace("/login");
  };

  const deleteUser = async () => {
    const { id } = session?.user as User;
    const backend_url = getBackendUrl();
    const sb_auth_token_name = Constants.expoConfig?.extra
      ?.SB_AUTH_TOKEN_NAME as string;

    try {
      const response = await axiosConfig.delete(
        backend_url + "/api/users/delete",
        {
          data: { userId: id },
          headers: { "Content-type": "application/json" },
        },
      );
      console.log("response status code: " + response.status);
      console.log(" delete user: " + response.data);
      signOut();
      await AsyncStorage.removeItem(sb_auth_token_name);
      localStorage.removeItem(sb_auth_token_name);
      router.replace("/login");
    } catch (err) {
      console.log("error occurred: " + (err as Error).message);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "Are you sure you want to delete your account? all the data will be lost upon deletion.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("deletion cancelled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => deleteUser(),
          style: "destructive",
        },
      ],
    );
  };

  return (
    <SafeAreaView>
      <View>
        <ThemedText>This is explore</ThemedText>
        <Pressable style={styles.button} onPress={() => handleSignOut()}>
          <ThemedText style={styles.text}>Log out</ThemedText>
        </Pressable>
        {/* <Pressable style={styles.button} onPress={() => handleDeleteAccount()}> */}
        <Pressable style={styles.button} onPress={() => deleteUser()}>
          <ThemedText style={styles.text}>Delete account</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 20,
    backgroundColor: "red",
    borderRadius: 20,
    padding: 10,
  },
  text: {
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Explore;
