import { Colors } from "@/src/constants/Colors";
import { GlobalStyles } from "@/src/constants/StyleConstants";
import { Appearance } from "react-native";
import { Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/src/components/ui/IconSymbol";
import { StyleSheet } from "react-native";
import { useSession } from "@/src/context/AuthContext";
import { routerReplace } from "@/src/utils/navigation";

const colorscheme = Appearance.getColorScheme();

function AccountOption({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: string;
  onPress: () => void;
}) {
  const color = colorscheme === "light" ? Colors.light.text : Colors.dark.text;
  return (
    <Pressable onPress={onPress} style={styles.itemContainer}>
      <Text style={GlobalStyles.smallTextBold}>{title}</Text>
      <IconSymbol size={18} name={icon} color={color} />
    </Pressable>
  );
}

function AccountSettings() {
  const { signOut, session } = useSession();

  const handleSignOut = async () => {
    signOut();
  };

  const options = [
    {
      id: 1,
      title: "Log out",
      icon: "arrow.right.alt",
      onPress: handleSignOut,
    },
    {
      id: 2,
      title: "Delete account",
      icon: "arrow.right.alt",
      onPress: () => console.log("choice: delete account"),
    },
  ];

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <FlatList
        style={styles.flatList}
        data={options}
        renderItem={({ item }) => (
          <AccountOption
            title={item.title}
            icon={item.icon}
            onPress={item.onPress}
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
});

export default AccountSettings;
