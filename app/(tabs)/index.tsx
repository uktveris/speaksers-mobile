import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { Link, useRouter } from "expo-router";
import { View, StyleSheet, ColorSchemeName, Appearance } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import { useSupabase } from "@/hooks/useSupabase";

function App() {
  const colorScheme = Appearance.getColorScheme();
  const styles = setStyles(colorScheme);
  const supabase = useSupabase();
  const router = useRouter();

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
    router.replace("/");
    return data.session;
  };

  const url = Linking.useURL();
  if (url) {
    createSessionFromUrl(url);
  }

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.container}>
        <ThemedText style={styles.text}>Some text</ThemedText>
        <Link style={styles.text} href="/explore">
          explore
        </Link>
      </View>
    </SafeAreaView>
  );
}

function setStyles(theme: ColorSchemeName) {
  return StyleSheet.create({
    outerContainer: {
      flex: 1,
      backgroundColor:
        theme === "light" ? Colors.light.background : Colors.dark.background,
    },
    container: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      top: 30,
      color: "red",
    },
    text: {
      color: "red",
      fontSize: 30,
      textAlign: "center",
      backgroundColor: "white",
      padding: 20,
      margin: 10,
    },
  });
}

export default App;
