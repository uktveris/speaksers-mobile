import { Colors } from "@/constants/Colors";
import { useSession } from "@/context/AuthContext";
import { getSupabaseClient } from "@/hooks/supabaseClient";
import { useEffect, useState } from "react";
import { Appearance } from "react-native";
import { ColorSchemeName } from "react-native";
import { StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import { Text } from "react-native";
import { GlobalStyles } from "@/constants/StyleConstants";
import { Image } from "react-native";
import { SafeAreaView } from "react-native";
import ProfileInfo from "@/components/ProfileInfo";

function Account() {
  const theme = Appearance.getColorScheme();
  const styles = setStyles(theme);

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <View style={styles.container}>
        <Text style={GlobalStyles.smallText}>settings?</Text>
        <ProfileInfo />
      </View>
    </SafeAreaView>
  );
}

export default Account;

function setStyles(theme: ColorSchemeName) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    text: {
      color: theme === "light" ? Colors.light.text : Colors.dark.text,
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 10,
    },
  });
}
