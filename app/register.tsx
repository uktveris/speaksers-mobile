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
import { TextInput } from "react-native-paper";
import { Keyboard } from "react-native";
import { Text } from "react-native";
import { GlobalStyles } from "@/constants/StyleConstants";
import SignUpErrorMessage from "@/components/SignUpErrorMessage";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const theme = Appearance.getColorScheme();

export default function Register() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repPassword, setRepPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepPassword, setShowRepPassword] = useState(false);
  const [errorsExist, setErrorExist] = useState(false);
  const router = useRouter();

  const signUpWithEmail = async () => {
    if (password !== repPassword) {
      setErrorExist(true);
      return;
    } else {
      setErrorExist(false);
    }
    setLoading(true);

    console.log("trying to create new user");

    const redirectUrl =
      Platform.OS === "web"
        ? "http://localhost:8081/auth-callback"
        : "speaksers://auth-calback";

    console.log("redirect url: " + redirectUrl);

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      console.log("called sb auth server");
      console.log("session: " + session);
      console.log("error: " + error);

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
    } catch (err) {
      console.log("error occurred: " + (err as Error).message);
      setLoading(false);
      return;
    }
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
          theme={{ roundness: 30 }}
          mode="flat"
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Your email address"
          keyboardType="email-address"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          importantForAccessibility="yes"
          textColor={theme === "light" ? Colors.light.text : Colors.dark.text}
          placeholderTextColor="grey"
        />
      </View>
      <View style={GlobalStyles.verticalSpacerMedium}></View>
      <View>
        <Text style={GlobalStyles.smallText}>Password</Text>
        <View style={GlobalStyles.verticalSpacerSmall}></View>
        <TextInput
          style={styles.inputBox}
          theme={{ roundness: 30 }}
          mode="flat"
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          onChangeText={(text) => setPassword(text)}
          value={password}
          placeholder="Password"
          secureTextEntry={!showPassword}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          importantForAccessibility="yes"
          textColor={theme === "light" ? Colors.light.text : Colors.dark.text}
          placeholderTextColor="grey"
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword((prev) => !prev)}
            />
          }
        />
      </View>
      <View style={GlobalStyles.verticalSpacerMedium}></View>
      <View>
        <Text style={GlobalStyles.smallText}>Repeat password</Text>
        <View style={GlobalStyles.verticalSpacerSmall}></View>
        <TextInput
          style={styles.inputBox}
          theme={{ roundness: 30 }}
          mode="flat"
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          onChangeText={(text) => setRepPassword(text)}
          value={repPassword}
          placeholder="Password"
          secureTextEntry={!showRepPassword}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          importantForAccessibility="yes"
          textColor={theme === "light" ? Colors.light.text : Colors.dark.text}
          placeholderTextColor="grey"
          right={
            <TextInput.Icon
              icon={showRepPassword ? "eye-off" : "eye"}
              onPress={() => setShowRepPassword((prev) => !prev)}
            />
          }
        />
      </View>
      {errorsExist && <SignUpErrorMessage message="Passwords do not match!" />}
      <View style={GlobalStyles.verticalSpacerLarge}></View>
      <Pressable
        style={[
          GlobalStyles.primaryButton,
          loading && GlobalStyles.disabledButton,
        ]}
        disabled={loading}
        onPress={() => signUpWithEmail()}
      >
        <Text style={GlobalStyles.mediumBoldText}>Sign up</Text>
      </Pressable>
      <View style={GlobalStyles.verticalSpacerMedium}></View>
      {/* <GoogleAuthButton /> */}
      <Pressable
        style={[
          GlobalStyles.secondaryButton,
          loading && GlobalStyles.disabledButton,
        ]}
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
    <KeyboardAwareScrollView
      style={styles.keyboardView}
      // behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {content}
    </KeyboardAwareScrollView>
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
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 30,
    color: theme === "light" ? Colors.light.text : Colors.dark.text,
  },
});
