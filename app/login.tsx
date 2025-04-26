import GoogleAuthButton from "@/components/oauth/GoogleAuthButton";
import { Colors } from "@/constants/Colors";
import { GlobalStyles } from "@/constants/StyleConstants";
import { useSession } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Appearance } from "react-native";
import { TextInput } from "react-native-paper";
import { KeyboardAvoidingView, Text } from "react-native";
import { Platform } from "react-native";
import { Keyboard } from "react-native";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native";
import { Alert, View } from "react-native";
import SignUpErrorMessage from "@/components/SignUpErrorMessage";

const colorScheme = Appearance.getColorScheme();

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorsExist, setErrorExist] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading } = useSession();

  const signInWithEmail = async () => {
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/(protected)/(tabs)");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("login failed: " + (error as Error).message);
      setErrorExist(true);
      setErrorMsg((error as Error).message);
      return;
    }
  };

  const content = (
    <View style={styles.container}>
      <Text style={GlobalStyles.titleText}>Log in</Text>
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
          textColor={
            colorScheme === "light" ? Colors.light.text : Colors.dark.text
          }
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
          textColor={
            colorScheme === "light" ? Colors.light.text : Colors.dark.text
          }
          placeholderTextColor="grey"
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword((prev) => !prev)}
            />
          }
        />
      </View>
      {errorsExist && <SignUpErrorMessage message={errorMsg} />}
      <View style={GlobalStyles.verticalSpacerLarge}></View>
      <Pressable
        style={[
          GlobalStyles.primaryButton,
          loading && GlobalStyles.disabledButton,
        ]}
        disabled={loading}
        onPress={() => signInWithEmail()}
      >
        <Text style={GlobalStyles.mediumBoldText}>Sign in</Text>
      </Pressable>
      <View style={GlobalStyles.verticalSpacerMedium}></View>
      {/* <GoogleAuthButton /> */}
      <Pressable
        style={[
          GlobalStyles.secondaryButton,
          loading && GlobalStyles.disabledButton,
        ]}
        disabled={loading}
        onPress={() => router.replace("/register")}
      >
        <Text style={GlobalStyles.mediumBoldText}>No Account? Sign up</Text>
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
  title: {
    fontSize: 40,
    fontWeight: "bold",
    paddingVertical: 20,
  },
  keyboardView: {
    backgroundColor:
      colorScheme === "light"
        ? Colors.light.background
        : Colors.dark.background,
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 0.5,
    justifyContent: "center",
    marginHorizontal: 40,
  },
  inputBox: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 30,
    color: colorScheme === "light" ? Colors.light.text : Colors.dark.text,
  },
});
