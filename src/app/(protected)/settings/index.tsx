import { IconSymbol } from "@/src/components/ui/IconSymbol";
import { Colors } from "@/src/constants/Colors";
import { settingsRoutes } from "@/src/constants/settingsRoutes";
import { GlobalStyles } from "@/src/constants/StyleConstants";
import { RelativePathString, Router, useRouter } from "expo-router";
import { Appearance } from "react-native";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native";
import { FlatList, useColorScheme } from "react-native";
import { Text } from "react-native";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colorscheme = Appearance.getColorScheme();

function SettingsItem({
  title,
  icon,
  route,
}: {
  title: string;
  icon: string;
  route: string;
}) {
  const color = colorscheme === "light" ? Colors.light.text : Colors.dark.text;
  const router = useRouter();

  const r = route as RelativePathString;
  return (
    <Pressable onPress={() => router.push(r)} style={styles.itemContainer}>
      <Text style={GlobalStyles.smallTextBold}>{title}</Text>
      <IconSymbol size={18} name="arrow.right.alt" color={color} />
    </Pressable>
  );
}

function Settings() {
  return (
    <SafeAreaView style={GlobalStyles.container}>
      <FlatList
        style={styles.flatList}
        data={settingsRoutes}
        renderItem={({ item }) => (
          <SettingsItem
            title={item.title}
            icon={item.icon}
            route={item.route}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flatList: {
    paddingHorizontal: 10,
  },
  itemContainer: {
    backgroundColor: Colors.base.darkTint,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 10,
    borderRadius: 20,
  },
  itemBottomBorder: {
    borderBottomWidth: 2,
    borderBottomColor:
      colorscheme === "light" ? Colors.light.text : Colors.dark.text,
  },
});

export default Settings;
