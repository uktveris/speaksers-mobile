import { useSession } from "@/context/AuthContext";
import { getSupabaseClient } from "@/hooks/supabaseClient";
import { useEffect, useState } from "react";
import Constants from "expo-constants";
import { View } from "react-native";
import { Image } from "react-native";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { GlobalStyles } from "@/constants/StyleConstants";

function ProfileInfo() {
  const { session } = useSession();
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const defaultUrl = Constants.expoConfig?.extra?.DEFAULT_AVATAR_URL;
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

      setName(userData.first_name ? userData.first_name : "no name");
      setLastName(userData.last_name ? userData.last_name : "no last name");
      setAvatarUrl(avatarData.publicUrl);
    };

    fetchUser();
  }, [session?.user]);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.infoContainer}>
        <View style={styles.userImage}>
          <Image source={{ uri: avatarUrl }} style={styles.image} />
        </View>
        <View style={styles.userInfo}>
          <Text style={GlobalStyles.mediumBoldText}>{name}</Text>
          <Text style={GlobalStyles.mediumBoldText}>{lastName}</Text>
        </View>
      </View>
      <View></View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderColor: "orange",
    borderWidth: 2,
    width: "100%",
    padding: 10,
  },
  userInfo: {
    width: "50%",
    justifyContent: "center",
  },
  userImage: {
    width: "50%",
    alignItems: "center",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 40,
  },
});

export default ProfileInfo;
