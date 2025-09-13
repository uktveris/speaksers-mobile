import GoogleAuthButton from "@/src/components/oauth/GoogleAuthButton";
import { Colors } from "@/src/constants/Colors";
import { useSession } from "@/src/context/AuthContext";
import { useEffect, useState } from "react";
import { Appearance } from "react-native";
import { ActivityIndicator, TextInput } from "react-native-paper";
import { KeyboardAvoidingView, Text } from "react-native";
import { Keyboard } from "react-native";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native";
import { Alert, View } from "react-native";
import SignUpErrorMessage from "@/src/components/SignUpErrorMessage";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { routerReplace, ROUTES } from "../utils/navigation";
import { useColorScheme } from "nativewind";
import { theme } from "@/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorsExist, setErrorExist] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading } = useSession();
  const colorScheme = useColorScheme();

  const textCol =
    colorScheme.colorScheme === "light"
      ? theme.colors.text.light
      : theme.colors.text.dark;

  const signInWithEmail = async () => {
    setLoading(true);
    try {
      await signIn(email, password);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("login failed: " + (error as Error).message);
      setErrorExist(true);
      setErrorMsg((error as Error).message);
      return;
    }
  };

  // TODO: style textinput text color with theme provider from nativewind
  return (
    <SafeAreaView className="h-full w-full bg-background-light dark:bg-background-dark">
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View className="flex-1 w-full items-center justify-center">
          <Text className="text-text-light dark:text-text-dark text-7xl font-bold p-5">
            Log in
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
          {errorsExist && <SignUpErrorMessage message={errorMsg} />}
          <Pressable
            className="bg-primary w-3/4  p-3 flex items-center rounded-3xl"
            disabled={loading}
            onPress={() => signInWithEmail()}
          >
            {loading && <ActivityIndicator color={theme.colors.text.dark} />}
            {!loading && (
              <Text className="text-text-dark font-bold text-2xl">Sign in</Text>
            )}
          </Pressable>
          {/* <GoogleAuthButton /> */}
          <Pressable
            className="p-4 pt-8"
            disabled={loading}
            onPress={() => routerReplace(ROUTES.register)}
          >
            <Text className="text-text-light dark:text-text-dark font-bold underline">
              No Account? Sign up
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
