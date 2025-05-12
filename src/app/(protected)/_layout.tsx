import { useSession } from "@/src/context/AuthContext";
import { getSocket } from "@/src/server/socket";
import { Redirect, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useUserCourses } from "@/src/hooks/useUserCourses";

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
      <Stack.Screen
        name="(account)/edit-account"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
