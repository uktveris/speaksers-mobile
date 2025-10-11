import { Stack } from "expo-router";

export default function DialogLayout() {
  return (
    <Stack>
      <Stack.Screen name="dialog" options={{ headerShown: false }} />
      <Stack.Screen name="dialogPrep" options={{ headerShown: false }} />
      <Stack.Screen name="dialogCall" options={{ headerShown: false }} />
    </Stack>
  );
}
