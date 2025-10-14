import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function Timer({
  callId,
  endTime,
  counting,
  onStopTimer,
  onTimerEnded,
}: {
  callId: string;
  endTime: number | null;
  counting: boolean;
  onStopTimer: () => void;
  onTimerEnded?: () => void;
}) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!endTime) return;
    const interval = setInterval(() => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        setRemaining(0);
        if (onTimerEnded) onTimerEnded();
      } else {
        setRemaining(diff);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [endTime]);

  return (
    <View className="flex justify-center items-center bg-background-dimmed rounded-3xl">
      {/*<Text className="text-text-light dark:text-text-dark">{counting ? "counting" : "timer stopped!"}</Text>*/}
      <Text className="text-text-light dark:text-text-dark text-xl font-bold">
        {endTime ? `${Math.floor(remaining / 1000)}s left` : "timer ended"}
      </Text>
    </View>
  );
}
