import { useSession } from "@/context/AuthContext";
import { getSupabaseClient } from "@/hooks/supabaseClient";
import { useEffect, useState } from "react";
import Constants from "expo-constants";
import { View } from "react-native";
import { Image } from "react-native";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { GlobalStyles } from "@/constants/StyleConstants";
import { Colors } from "@/constants/Colors";

function ProfileInfo() {
  const { session } = useSession();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

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

      setUsername(userData.username ? userData.username : "no username");
      setName(userData.name ? userData.name : "no name");
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
          <Text style={GlobalStyles.smallTextBold}>{username}</Text>
          <Text style={GlobalStyles.smallTextBold}>{name}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: "100%",
    padding: 10,
  },
  userInfo: {
    flex: 2,
    justifyContent: "center",
  },
  userImage: {
    flex: 1,
    alignItems: "center",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    backgroundColor: Colors.base.darkTint,
    paddingVertical: 10,
    borderRadius: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 40,
  },
});

export default ProfileInfo;
