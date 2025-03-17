import GoogleAuthButton from "@/components/oauth/GoogleAuthButton";
import { ThemedText } from "@/components/ThemedText";
import { useSupabase } from "@/hooks/useSupabase";
import { Button, Input } from "@rneui/themed";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native";
import { Alert, View } from "react-native";

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
      return;
    }
    setLoading(false);
    router.replace("/(tabs)/");
  };

  return (
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
  );
}

const styles = StyleSheet.create({
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
