import { useNetwork } from "@/src/context/NetworkContext";
import { useEffect, useState } from "react";
import { Animated, Text } from "react-native";

export default function OfflineBanner() {
  const { isConnected } = useNetwork();
  const [visible] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(visible, {
      toValue: isConnected ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected]);
  return (
    <Animated.View
      className="absolute top-0 w-full bg-background-light dark:bg-background-dark py-2 items-center z-50"
      style={{
        opacity: visible,
        transform: [
          {
            translateY: visible.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            }),
          },
        ],
      }}
    >
      <Text className="text-text-light dark:text-text-dark font-bold">No internet connection</Text>
    </Animated.View>
  );
}
