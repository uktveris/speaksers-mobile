import { useEffect, useRef } from "react";
import { View } from "react-native";
import { Animated, Easing } from "react-native";

interface LoadingDotsProps {
  dotColor?: string;
  dotSize?: number;
  dotSpacing?: number;
}

export default function LoadingDots({
  dotColor,
  dotSize,
  dotSpacing,
}: LoadingDotsProps) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const createBounce = (anim: Animated.Value, delay: number) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: -dotSize / 2,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
  };
  useEffect(() => {
    createBounce(dot1, 0).start();
    createBounce(dot2, 150).start();
    createBounce(dot3, 300).start();
  }, [dot1, dot2, dot3, dotSize]);

  return (
    <View style={{ flexDirection: "row", gap: dotSpacing }}>
      {[dot1, dot2, dot3].map((anim, index) => (
        <Animated.View
          key={index}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: dotColor,
            transform: [{ translateY: anim }],
          }}
        />
      ))}
    </View>
  );
}
