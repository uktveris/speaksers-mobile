import { useEffect, useState } from "react";
import { getSocket } from "../server/socket";
import { Pressable, Text, View } from "react-native";

export default function Timer({
  callId,
  endTime,
  counting,
  onStopTimer,
}: {
  callId: string;
  endTime: number | null;
  counting: boolean;
  onStopTimer: () => void;
}) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!endTime) return;
    const interval = setInterval(() => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        setRemaining(0);
      } else {
        setRemaining(diff);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [endTime]);

  return (
    <View className="flex justify-center items-center">
      <Text className="text-text-light dark:text-text-dark">
        {counting ? "counting" : "timer stopped!"}
      </Text>
      <Text className="text-text-light dark:text-text-dark">
        {endTime ? `${Math.floor(remaining / 1000)}s left` : "timer ended"}
      </Text>
      <Pressable
        onPress={() => onStopTimer()}
        className="mt-5 bg-primary w-2/4 p-3 px-5 flex items-center rounded-3xl"
      >
        <Text className="text-text-light dark:text-text-dark">Stop timer</Text>
      </Pressable>
    </View>
  );
}
