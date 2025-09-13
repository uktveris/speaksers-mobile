import React, { useEffect } from "react";
import { Dimensions, Pressable, View } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";

// const { height } = Dimensions.get("window");

interface BottomModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height: string;
}

export function BottomModal({
  visible,
  onClose,
  children,
  height = "2/5",
}: BottomModalProps) {
  // const translateY = useSharedValue(height);
  const translateY = useSharedValue(Dimensions.get("window").height);

  useEffect(() => {
    if (visible) {
      // translateY.value = withTiming(height * 0.4, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      // translateY.value = withTiming(height, { duration: 300 });
      translateY.value = withTiming(Dimensions.get("window").height, {
        duration: 300,
      });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <>
      {visible && (
        <Pressable className="absolute inset-0 bg-black/50" onPress={onClose} />
      )}

      <Animated.View
        style={[animatedStyle]}
        // className={`absolute bottom-0 w-full h-${height} bg-white rounded-t-3xl p-4 shadow-lg`}
        className="absolute bottom-0 w-full bg-white rounded-t-3xl p-4 shadow-lg"
      >
        <View className="flex-1 max-h-3/4">{children}</View>
      </Animated.View>
    </>
  );
}
