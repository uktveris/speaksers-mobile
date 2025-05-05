import { useEffect } from "react";
import { View, Text } from "react-native";
import { StyleSheet } from "react-native";
import { Pressable } from "react-native";
import { TouchableWithoutFeedback } from "react-native";
import { Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface BottomModalProps {
  visible: boolean;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

function BottomModal({ visible, onClose }: BottomModalProps) {
  const height = SCREEN_HEIGHT * 0.3;
  const translateY = useSharedValue(height);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      translateY.value = withTiming(height, { duration: 300 });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View>
      {visible && (
        <TouchableWithoutFeedback>
          <View style={styles.backdrop}></View>
        </TouchableWithoutFeedback>
      )}
      <Animated.View style={[styles.modal, { height }, animStyle]}>
        <Pressable style={styles.dragHandle} onPress={onClose} />
        <Text>this is modal text</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
  },
  dragHandle: {
    alignSelf: "center",
    width: 30,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginBottom: 10,
  },
});

export default BottomModal;
