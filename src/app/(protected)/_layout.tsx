import { useSession } from "@/src/context/AuthContext";
import { getSocket } from "@/src/server/socket";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { useUserCourses } from "@/src/hooks/useUserCourses";
import { routerReplace, ROUTES } from "@/src/utils/navigation";

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const { courses, loading } = useUserCourses();

  useEffect(() => {
    if (!isLoading && !loading && session && courses.length == 0) {
      routerReplace(ROUTES.languageCourseSelection);
      return;
    }

    const socket = getSocket();
    if (!socket.connected) {
      console.log("no socket found, connecting");
      socket.connect();
    }

    const handleConnectSuccess = () => {
      console.log("socket connected successfully");
    };

    socket.on("connect", handleConnectSuccess);

    return () => {
      socket.off("connect", handleConnectSuccess);
    };
  }, [isLoading, loading, session, courses.length]);

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Redirect href="../login" />;
  }

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
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}
