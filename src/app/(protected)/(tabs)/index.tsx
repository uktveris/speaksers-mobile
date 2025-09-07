import { View, StyleSheet, ColorSchemeName, Appearance } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import { getSupabaseClient } from "@/src/hooks/supabaseClient";
import GameBox from "@/src/components/GameBox";
import { GlobalStyles } from "@/src/constants/StyleConstants";
import { Text } from "react-native";
import { routerReplace, ROUTES } from "@/src/utils/navigation";

const colorScheme = Appearance.getColorScheme();
const styles = setStyles(colorScheme);
export default function App() {
  const supabase = getSupabaseClient();

  const createSessionFromUrl = async (url: string) => {
    const { params, errorCode } = QueryParams.getQueryParams(url);
    if (errorCode) {
      throw new Error(errorCode);
    }

    const { accessToken, refreshToken } = params;
    if (!accessToken) {
      return;
    }
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) {
      console.log("ERROR: " + error.message);
    }
    routerReplace(ROUTES.homeScreen);
    return data.session;
  };

  const url = Linking.useURL();
  if (url) {
    createSessionFromUrl(url);
  }

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <View style={styles.container}>
        <Row>
          <Col>
            <GameBox
              backgroundColor="#ff9933"
              name="Dialog"
              link={ROUTES.dialog}
            />
          </Col>
          <Col>
            <GameBox backgroundColor="#C70039" name="Game" link="" />
          </Col>
        </Row>
      </View>
    </SafeAreaView>
  );
}

function Row({ children }: { children: any }) {
  return <View style={styles.row}>{children}</View>;
}

function Col({ children }: { children: any }) {
  return <View style={styles.column}>{children}</View>;
}

function setStyles(theme: ColorSchemeName) {
  return StyleSheet.create({
    container: {
      flex: 2,
      width: "100%",
      color: "red",
    },
    text: {
      color: "red",
      fontSize: 30,
      textAlign: "center",
      backgroundColor: "white",
      padding: 20,
      margin: 10,
    },
    row: {
      flexDirection: "row",
    },
    column: {
      margin: 10,
      flex: 2,
      borderColor: "white",
      borderRadius: 20,
      overflow: "hidden",
    },
  });
}
