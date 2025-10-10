import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function Preferences() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isEnabled, setIsEnabled] = useState(colorScheme === "light" ? false : true);
  const toggleColorScheme = () => {
    setIsEnabled((prev) => !prev);
    setColorScheme(colorScheme === "light" ? "dark" : "light");
  };

  return (
    <SafeAreaView className="h-full bg-background-light dark:bg-background-dark">
      <View className="px-2">
        <Text className="text-text-light dark:text-text-dark text-3xl font-bold">Preferences</Text>
        <View className="flex flex-row py-3 justify-between items-center w-full">
          <View className="max-w-72">
            <Text className="text-text-light dark:text-text-dark">Dark theme</Text>
            <Text className="text-text-light_dimmed dark:text-text-dark_dimmed text-xs">
              Enable dark theme for the app. Default: system preference.
            </Text>
          </View>
          <Switch value={isEnabled} onValueChange={toggleColorScheme} />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default Preferences;
