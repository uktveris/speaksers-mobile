import { useSession } from "@/context/AuthContext";
import { getSocket } from "@/server/socket";
import { Redirect, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as Linking from "expo-linking";
import { getSupabaseClient } from "@/hooks/supabaseClient";
import { useUserCourses } from "@/hooks/useUserCourses";

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const router = useRouter();
  const { courses, loading } = useUserCourses();

  useEffect(() => {
    if (!isLoading && !loading && session && courses.length == 0) {
      router.replace("/(protected)/language-course-selection");
    }
  }, [isLoading, loading, session, courses.length, router]);

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
      <Stack.Screen
        name="language-course-selection"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
