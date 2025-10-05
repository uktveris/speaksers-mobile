import { Alert, Appearance } from "react-native";
import { Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/src/components/ui/IconSymbol";
import { useSession } from "@/src/context/AuthContext";
import { routerReplace } from "@/src/utils/navigation";

function AccountOption({ title, icon, onPress }: { title: string; icon: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex flex-row border border-contrast-light dark:border-contrast-dark rounded-xl p-4 mb-2 justify-between"
    >
      <Text className="text-contrast-light dark:text-contrast-dark font-bold text-lg">{title}</Text>
      <IconSymbol size={18} name={icon} className="text-contrast-light dark:text-contrast-dark font-bold" />
    </Pressable>
  );
}

function AccountSettings() {
  const { signOut, session, deleteAcount } = useSession();

  const handleSignOut = async () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        onPress: () => console.log("logging out cancelled"),
        style: "cancel",
      },
      {
        text: "Log out",
        onPress: () => signOut(),
        style: "default",
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete account",
      "Are you sure you want to delete your account? all the data will be lost upon deletion.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("deletion cancelled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => deleteAcount(),
          style: "destructive",
        },
      ],
    );
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
      onPress: handleDelete,
    },
  ];

  return (
    <SafeAreaView className="h-full bg-background-light dark:bg-background-dark">
      <FlatList
        className="px-2"
        data={options}
        renderItem={({ item }) => <AccountOption title={item.title} icon={item.icon} onPress={item.onPress} />}
      />
    </SafeAreaView>
  );
}

export default AccountSettings;
