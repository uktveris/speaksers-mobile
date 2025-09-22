import GoogleAuthButton from "@/src/components/oauth/GoogleAuthButton";
import { getSupabaseClient } from "@/src/hooks/supabaseClient";
import { useState } from "react";
import { Appearance } from "react-native";
import { Pressable } from "react-native";
import { KeyboardAvoidingView } from "react-native";
import { Platform } from "react-native";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import { Alert } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { ActivityIndicator, TextInput } from "react-native-paper";
import { Keyboard } from "react-native";
import { Text } from "react-native";
import SignUpErrorMessage from "@/src/components/SignUpErrorMessage";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { routerReplace, ROUTES } from "../utils/navigation";
import { useColorScheme } from "nativewind";
import { theme } from "@/theme";

export default function Register() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repPassword, setRepPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepPassword, setShowRepPassword] = useState(false);
  const [errorsExist, setErrorExist] = useState(false);
  const colorScheme = useColorScheme();

  const textCol =
    colorScheme.colorScheme === "light"
      ? theme.colors.text.light
      : theme.colors.text.dark;

  const signUpWithEmail = async () => {
    if (password !== repPassword) {
      setErrorExist(true);
      return;
    } else {
      setErrorExist(false);
    }
    setLoading(true);

    const redirectUrl =
      Platform.OS === "web"
        ? "http://localhost:8081/auth-callback"
        : "speaksers://auth-calback";

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
      routerReplace(ROUTES.homeScreen);
    } catch (err) {
      console.log("error occurred: " + (err as Error).message);
      setLoading(false);
      return;
    }
  };

  return (
    <SafeAreaView className="h-full w-full bg-background-light dark:bg-background-dark">
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
        extraKeyboardSpace={50}
      >
        <View className="flex-1 w-full items-center justify-center">
          <Text className="text-text-light dark:text-text-dark text-7xl font-bold p-5">
            Sign up
          </Text>
          <View className="h-min m-5 mb-0 px-10 w-full">
            <Text className="ml-4 mb-3 text-text-light dark:text-text-dark">
              Email
            </Text>
            <TextInput
              textColor={textCol}
              className="rounded-3xl bg-black/25 my-1"
              style={{ backgroundColor: "transparent" }}
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
              placeholderTextColor="grey"
            />
          </View>
          <View className="h-min m-5 px-10 w-full">
            <Text className="ml-4 mb-3 text-text-light dark:text-text-dark">
              Password
            </Text>
            <TextInput
              textColor={textCol}
              className="rounded-3xl bg-black/25 w-full my-1"
              style={{ backgroundColor: "transparent" }}
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
              placeholderTextColor="grey"
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword((prev) => !prev)}
                />
              }
            />
          </View>
          <View className="h-min m-5 px-10 w-full mt-1">
            <Text className="ml-4 mb-3 text-text-light dark:text-text-dark">
              Repeat password
            </Text>
            <TextInput
              textColor={textCol}
              className="rounded-3xl bg-black/25 w-full my-1"
              style={{ backgroundColor: "transparent" }}
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
              placeholderTextColor="grey"
              right={
                <TextInput.Icon
                  icon={showRepPassword ? "eye-off" : "eye"}
                  onPress={() => setShowRepPassword((prev) => !prev)}
                />
              }
            />
          </View>
          {errorsExist && (
            <SignUpErrorMessage message="Passwords do not match!" />
          )}
          <Pressable
            className="bg-primary w-3/4  p-3 flex items-center rounded-3xl"
            disabled={loading}
            onPress={() => signUpWithEmail()}
          >
            {loading && <ActivityIndicator color={theme.colors.text.dark} />}
            {!loading && (
              <Text className="text-text-dark font-bold text-2xl">Sign up</Text>
            )}
          </Pressable>
          {/* <GoogleAuthButton /> */}
          <Pressable
            className="p-4 pt-8"
            disabled={loading}
            onPress={() => routerReplace(ROUTES.login)}
          >
            <Text className="text-text-light dark:text-text-dark font-bold underline">
              Alredy have an account? Log in!
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
