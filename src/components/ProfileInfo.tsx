import { useSession } from "@/src/context/AuthContext";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Image } from "react-native";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { useUser } from "../hooks/useUser";

function ProfileInfo() {
  const { session } = useSession();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const { userData, avatarUrl: originalAvatarUrl, loading } = useUser();

  useEffect(() => {
    if (!session || !userData) {
      console.log("no session, returning");
      return;
    }
    setUsername(userData.username ? userData.username : "no username");
    setName(userData.name ? userData.name : "no name");
    setAvatarUrl(originalAvatarUrl!);
  }, [session?.user, loading]);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.infoContainer}>
        <View style={styles.userImage}>
          <Image source={{ uri: avatarUrl }} style={styles.image} />
        </View>
        <View style={styles.userInfo}>
          <Text>{username}</Text>
          <Text>{name}</Text>
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
