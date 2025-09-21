import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function Preferences() {
  return (
    <SafeAreaView className="h-full bg-background-light dark:bg-background-dark">
      <Text className="text-text-light dark:text-text-dark">Preferences</Text>
    </SafeAreaView>
  );
}

export default Preferences;
