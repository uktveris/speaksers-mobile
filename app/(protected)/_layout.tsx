import { useSession } from "@/context/AuthContext";
import { getSocket } from "@/server/socket";
import { Redirect, Stack } from "expo-router";

export default function AppLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Redirect href="../login" />;
  }

  const socket = getSocket();
  if (!socket.connected) socket.connect();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(dialog)" options={{ headerShown: false }} />
    </Stack>
  );
}
