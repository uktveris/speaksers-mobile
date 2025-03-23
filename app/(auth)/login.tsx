import GoogleAuthButton from "@/components/oauth/GoogleAuthButton";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useSupabase } from "@/hooks/useSupabase";
import { Input } from "@rneui/themed";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Appearance } from "react-native";
import { TextInput } from "react-native";
import { KeyboardAvoidingView, Text } from "react-native";
import { Platform } from "react-native";
import { Keyboard } from "react-native";
import { TouchableWithoutFeedback } from "react-native";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native";
import { Alert, View } from "react-native";

const colorScheme = Appearance.getColorScheme();

export default function Login() {
  const supabase = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signInWithEmail = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    console.log("user logged in!");
    const user = await supabase.auth.getUser();
    console.log("user: ");
    console.log({ user });
    router.replace("/(tabs)/");
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ThemedText style={styles.title}>Log in</ThemedText>
          <View>
            <ThemedText>Email</ThemedText>
            <TextInput
              style={styles.inputBox}
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder="Your email address"
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>
          <View>
            <ThemedText>Password</ThemedText>
            <TextInput
              style={styles.inputBox}
              onChangeText={(text) => setPassword(text)}
              value={password}
              placeholder="Your password"
              secureTextEntry={true}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>
          <View>
            <Pressable
              style={styles.button}
              disabled={loading}
              onPress={() => signInWithEmail()}
            >
              <ThemedText style={styles.text}>Sign in</ThemedText>
            </Pressable>
          </View>
          {/* <GoogleAuthButton /> */}
          <View>
            <Pressable
              style={styles.button}
              disabled={loading}
              onPress={() => router.replace("/register")}
            >
              <ThemedText style={styles.text}>No account? Sign up!</ThemedText>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 0.5,
    justifyContent: "center",
    marginHorizontal: 40,
  },
  inputBox: {
    borderWidth: 0.3,
    borderColor: "white",
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 20,
    color: colorScheme === "light" ? Colors.light.text : Colors.dark.text,
  },
  button: {
    marginTop: 20,
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    padding: 10,
  },
  text: {
    fontWeight: "bold",
    textAlign: "center",
  },
});
