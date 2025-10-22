import { useSession } from "@/src/context/AuthContext";
import { getSocket } from "@/src/server/socket";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { useUserCourses } from "@/src/hooks/useUserCourses";
import { routerReplace, ROUTES } from "@/src/utils/navigation";
import { ModalProvider } from "@/src/context/ModalContext";
import axiosConfig from "@/src/config/axiosConfig";
import { getBackendUrl } from "@/src/config/urlConfig";
import { Alert } from "react-native";

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

    const checkBackendHealth = async () => {
      const url = getBackendUrl();
      try {
        const response = await axiosConfig.get(url + "/api/health");
        console.log("success, backend health check response:", response.data);
      } catch (error) {
        Alert.alert("Service error", "Backend service error: " + (error as Error).message, [
          { text: "Cancel", onPress: () => console.log("cancelled backend error message") },
        ]);
      }
    };
    checkBackendHealth();

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
      <Stack.Screen name="language-course-selection" options={{ headerShown: false }} />
      <Stack.Screen name="(account)/edit-account" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}
