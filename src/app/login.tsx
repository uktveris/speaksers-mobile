import GoogleAuthButton from "@/src/components/oauth/GoogleAuthButton";
import { Colors } from "@/src/constants/Colors";
import { FontSizes, GlobalStyles } from "@/src/constants/StyleConstants";
import { useSession } from "@/src/context/AuthContext";
import { useState } from "react";
import { Appearance } from "react-native";
import { TextInput } from "react-native-paper";
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

const colorScheme = Appearance.getColorScheme();

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorsExist, setErrorExist] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading } = useSession();

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

  return (
    <SafeAreaView style={[GlobalStyles.container, styles.outerContainer]}>
      <View style={styles.container}>
        <Text style={GlobalStyles.titleText}>Log in</Text>
        <View style={GlobalStyles.verticalSpacerLarge}></View>
        <View>
          <Text style={GlobalStyles.smallText}>Email</Text>
          <View style={GlobalStyles.verticalSpacerSmall}></View>
          <TextInput
            style={styles.inputBox}
            theme={{ roundness: 10 }}
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
        <View style={GlobalStyles.verticalSpacerSmall}></View>
        <View>
          <Text style={GlobalStyles.smallText}>Password</Text>
          <View style={GlobalStyles.verticalSpacerSmall}></View>
          <TextInput
            style={styles.inputBox}
            theme={{ roundness: 10 }}
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
          // onPress={() => router.replace("/register")}
          onPress={() => routerReplace(ROUTES.register)}
        >
          <Text style={GlobalStyles.mediumBoldText}>No Account? Sign up</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    justifyContent: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    paddingVertical: 20,
  },
  container: {
    flex: 0.5,
    justifyContent: "center",
    marginHorizontal: 40,
  },
  inputBox: {
    fontSize: FontSizes.small,
    backgroundColor: Colors.base.inputFieldBack,
    borderRadius: 10,
    color: colorScheme === "light" ? Colors.light.text : Colors.dark.text,
  },
});
