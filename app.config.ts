import "dotenv/config";
import { version } from "./package.json";
import { ConfigContext, ExpoConfig } from "expo/config";

// eas setup
const EAS_PROJECT_SLUG = "speaksers-app";
const EAS_PROJECT_ID = "2b1aea07-cf67-4902-8f35-ac16d83e6099";
const EAS_OWNER = "mariusuktveris";

const APP_NAME = "Speaksers";
const BUNDLE_IDENTIFIER = "com.speaksersedu.speaksers";
const PACKAGE_NAME = "com.speaksersedu.speaksers";
const ICON = "./assets/images/icon.png";
const SCHEME = "speaksers";

export default ({ config }: ConfigContext): ExpoConfig => {
  console.log("BUILDING APP FOR ENVIRONMENT:", process.env.APP_ENV);
  const { name, bundleIdentifier, packageName, icon, scheme } =
    getDynamicAppConfig(
      (process.env.APP_ENV as "development" | "preview" | "production") ||
        "development",
    );
  return {
    ...config,
    name: name,
    slug: EAS_PROJECT_SLUG,
    version: version,
    orientation: "portrait",
    icon: icon,
    scheme: scheme,
    newArchEnabled: true,
    userInterfaceStyle: "automatic",
    splash: {
      image: icon,
      imageWidth: 300,
      resizeMode: "cover",
      backgroundColor: "#FF0000",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleIdentifier,
      infoPlist: {
        UIBackgroundModes: ["audio"],
        NSMicrophoneUsageDescription:
          "This app uses microphone for audio calls.",
      },
    },
    android: {
      package: packageName,
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.INTERNET",
      ],
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-localization",
      "@config-plugins/react-native-webrtc",
      [
        "expo-image-picker",
        {
          photosPermission: `Allow ${APP_NAME} to access your photos to update profile picture.`,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: EAS_PROJECT_ID,
      },
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
      SB_TOKEN_NAME: process.env.EXPO_PUBLIC_SB_TOKEN_NAME,
    },
    updates: {
      url: "https://u.expo.dev/2b1aea07-cf67-4902-8f35-ac16d83e6099",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    owner: EAS_OWNER,
  };
};

export const getDynamicAppConfig = (
  environment: "development" | "preview" | "production",
) => {
  if (environment === "production") {
    return {
      name: APP_NAME,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      packageName: PACKAGE_NAME,
      icon: ICON,
      scheme: SCHEME,
    };
  } else if (environment === "preview") {
    return {
      name: `${APP_NAME} Preview`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}.preview`,
      packageName: `${PACKAGE_NAME}.preview`,
      icon: "./assets/images/icons/iOS-Prev.png",
      adaptiveIcon: "./assets/images/icons/Android-Prev.png",
      scheme: `${SCHEME}-prev`,
    };
  }
  return {
    name: `${APP_NAME} Development`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER}.dev`,
    packageName: `${PACKAGE_NAME}.dev`,
    icon: "./assets/images/icons/iOS-Dev.png",
    adaptiveIcon: "./assets/images/icons/Android-Dev.png",
    scheme: `${SCHEME}-dev`,
  };
};
