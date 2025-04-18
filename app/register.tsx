import GoogleAuthButton from "@/components/oauth/GoogleAuthButton";
import { getSupabaseClient } from "@/hooks/supabaseClient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Appearance } from "react-native";
import { Pressable } from "react-native";
import { KeyboardAvoidingView } from "react-native";
import { Platform } from "react-native";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import { Alert } from "react-native";
import { Colors } from "@/constants/Colors";
import { TextInput } from "react-native";
import { Keyboard } from "react-native";
import { Text } from "react-native";
import { GlobalStyles } from "@/constants/StyleConstants";

const theme = Appearance.getColorScheme();

export default function Register() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signUpWithEmail = async () => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: "speaksers://auth/callback",
      },
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }
    if (!session) {
      Alert.alert("Check your email for verification please!");
      setLoading(false);
      return;
    }
    setLoading(false);
    router.replace("/(protected)/(tabs)");
  };

  const content = (
    <View style={styles.container}>
      <Text style={GlobalStyles.titleText}>Sign up</Text>
      <View style={GlobalStyles.verticalSpacerLarge}></View>
      <View>
        <Text style={GlobalStyles.smallText}>Email</Text>
        <View style={GlobalStyles.verticalSpacerSmall}></View>
        <TextInput
          style={styles.inputBox}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Your email address"
          keyboardType="email-address"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          importantForAccessibility="yes"
        />
      </View>
      <View style={GlobalStyles.verticalSpacerMedium}></View>
      <View>
        <Text style={GlobalStyles.smallText}>Password</Text>
        <View style={GlobalStyles.verticalSpacerSmall}></View>
        <TextInput
          style={styles.inputBox}
          onChangeText={(text) => setPassword(text)}
          value={password}
          placeholder="Password"
          secureTextEntry={true}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          importantForAccessibility="yes"
        />
      </View>
      <View style={GlobalStyles.verticalSpacerLarge}></View>
      <Pressable
        style={GlobalStyles.primaryButton}
        disabled={loading}
        onPress={() => signUpWithEmail()}
      >
        <Text style={GlobalStyles.mediumBoldText}>Sign up</Text>
      </Pressable>
      <View style={GlobalStyles.verticalSpacerMedium}></View>
      {/* <GoogleAuthButton /> */}
      <Pressable
        style={GlobalStyles.secondaryButton}
        disabled={loading}
        onPress={() => router.replace("/login")}
      >
        <Text style={[GlobalStyles.mediumBoldText, { textAlign: "center" }]}>
          Alredy have an account? Log in!
        </Text>
      </Pressable>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor:
      theme === "light" ? Colors.light.background : Colors.dark.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 40,
  },
  inputBox: {
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    color: theme === "light" ? Colors.light.text : Colors.dark.text,
  },
  button: {
    marginTop: 20,
    backgroundColor: "grey",
    borderRadius: 20,
    padding: 10,
  },
  text: {
    fontWeight: "bold",
    textAlign: "center",
  },
});
