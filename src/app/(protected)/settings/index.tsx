import { IconSymbol } from "@/src/components/ui/IconSymbol";
import { settingsRoutes } from "@/src/constants/settingsRoutes";
import { routerPush } from "@/src/utils/navigation";
import { RelativePathString } from "expo-router";
import { Appearance } from "react-native";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native";
import { FlatList, useColorScheme } from "react-native";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function SettingsItem({ title, icon, route }: { title: string; icon: string; route: string }) {
  return (
    <Pressable
      onPress={() => routerPush(route)}
      className="flex flex-row border border-contrast-light dark:border-contrast-dark rounded-xl p-4 mb-2 justify-between"
    >
      <Text className="text-contrast-light dark:text-contrast-dark font-bold text-lg">{title}</Text>
      <IconSymbol
        className="text-contrast-light dark:text-contrast-dark font-bold"
        size={18}
        name={icon}
        color="#000"
      />
    </Pressable>
  );
}

function Settings() {
  return (
    <SafeAreaView className="h-full bg-background-light dark:bg-background-dark">
      <FlatList
        className="px-2"
        data={settingsRoutes}
        renderItem={({ item }) => <SettingsItem title={item.title} icon={item.icon} route={item.route} />}
      />
    </SafeAreaView>
  );
}

export default Settings;
