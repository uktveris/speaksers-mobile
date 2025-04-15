import GoogleAuthButton from "@/components/oauth/GoogleAuthButton";
import { ThemedText } from "@/components/ThemedText";
import { getSupabaseClient } from "@/hooks/supabaseClient";
import { Button, Input } from "@rneui/themed";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable } from "react-native";
import { KeyboardAvoidingView } from "react-native";
import { TouchableWithoutFeedback } from "react-native";
import { Platform } from "react-native";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import { Alert } from "react-native";

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

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback>
        <View style={styles.container}>
          <View style={styles.inputBox}>
            <Input
              label="Email"
              leftIcon={{ type: "font-awesome", name: "envelope" }}
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder="email@address.com"
              autoCapitalize={"none"}
            />
          </View>
          <View style={styles.inputBox}>
            <Input
              label="Password"
              leftIcon={{ type: "font-awesome", name: "lock" }}
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              placeholder="Password"
              autoCapitalize={"none"}
            />
          </View>
          <View>
            <Pressable
              style={styles.button}
              disabled={loading}
              onPress={() => signUpWithEmail()}
            >
              <ThemedText style={styles.text}>Sign up</ThemedText>
            </Pressable>
          </View>
          {/* <GoogleAuthButton /> */}
          <View>
            <Pressable
              style={styles.button}
              disabled={loading}
              onPress={() => router.replace("/login")}
            >
              <ThemedText style={styles.text}>
                Alredy have an account? Log in!
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 40,
  },
  inputBox: {},
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
