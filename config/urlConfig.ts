import { Platform } from "react-native";
import Constants from "expo-constants";

const getBackendUrl = () => {
  if (Platform.OS === "web") {
    return Constants.expoConfig?.extra?.BACKEND_URL_LOCAL!;
  } else {
    return Constants.expoConfig?.extra?.BACKEND_URL!;
  }
};

export { getBackendUrl };
