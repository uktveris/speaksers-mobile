import { useSession } from "@/context/AuthContext";
import { getSocket } from "@/server/socket";
import { Redirect, Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import * as Linking from "expo-linking";
import { getSupabaseClient } from "@/hooks/supabaseClient";

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const router = useRouter();

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
