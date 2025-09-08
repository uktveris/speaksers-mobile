import { IconSymbol } from "@/src/components/ui/IconSymbol";
import { Colors } from "@/src/constants/Colors";
import { settingsRoutes } from "@/src/constants/settingsRoutes";
import { routerPush } from "@/src/utils/navigation";
import { RelativePathString } from "expo-router";
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

  return (
    <Pressable onPress={() => routerPush(route)} style={styles.itemContainer}>
      <Text>{title}</Text>
      <IconSymbol size={18} name={icon} color={color} />
    </Pressable>
  );
}

function Settings() {
  return (
    <SafeAreaView>
      <FlatList
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

export default Settings;
