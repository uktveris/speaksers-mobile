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
const DOMAIN = "speaksers.com";
const SCHEME = "speaksers";

export default ({ config }: ConfigContext): ExpoConfig => {
  console.log("BUILDING APP FOR ENVIRONMENT:", process.env.APP_ENV);
  const { name, bundleIdentifier, packageName, associatedDomain, /*icon */ scheme } = getDynamicAppConfig(
    (process.env.APP_ENV as "development" | "preview" | "production") || "development",
  );
  return {
    ...config,
    name: name,
    slug: EAS_PROJECT_SLUG,
    version: version,
    orientation: "portrait",
    scheme: scheme,
    newArchEnabled: true,
    userInterfaceStyle: "automatic",
    splash: {
      imageWidth: 300,
      resizeMode: "cover",
      backgroundColor: "#FF0000",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleIdentifier,
      infoPlist: {
        UIBackgroundModes: ["audio"],
        NSMicrophoneUsageDescription: "This app uses microphone for audio calls.",
        ITSAppUsesNonExemptEncryption: false,
      },
      icon: {
        dark: "./assets/images/ios-dark.png",
        light: "./assets/images/ios-light.png",
        tinted: "./assets/images/ios-tinted.png",
      },
      associatedDomains: [`applinks:${associatedDomain}`],
    },
    android: {
      package: packageName,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        monochromeImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: ["android.permission.RECORD_AUDIO", "android.permission.INTERNET"],
      blockedPermissions: ["android.permission.CAMERA"],
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: associatedDomain,
              pathPrefix: "/auth/callback",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          data: [
            {
              scheme: scheme,
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon-dark.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            image: "./assets/images/splash-icon-light.png",
            backgroundColor: "#0a0a0a",
          },
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
      [
        "expo-audio",
        {
          microphonePermission: `Allow ${APP_NAME} to access your microphone.`,
        },
      ],
      // [
      //   "expo-build-properties",
      //   {
      //     android: {
      //       minSdkVersion: 24,
      //       compileSdkVersion: 34,
      //       targetSdkVersion: 34,
      //       buildToolsVersion: "34.0.0",
      //     }
      //   }
      // ]
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
      SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
      SB_TOKEN_NAME: process.env.EXPO_PUBLIC_SB_TOKEN_NAME,
      SUPABASE_REDIRECT_URL: process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL,
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

export const getDynamicAppConfig = (environment: "development" | "preview" | "production") => {
  if (environment === "production") {
    return {
      name: APP_NAME,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      packageName: PACKAGE_NAME,
      associatedDomain: DOMAIN,
      scheme: SCHEME,
    };
  } else if (environment === "preview") {
    return {
      name: `${APP_NAME} Preview`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}.preview`,
      packageName: `${PACKAGE_NAME}.preview`,
      associatedDomain: `preview.${DOMAIN}`,
      scheme: `${SCHEME}-prev`,
    };
  }
  return {
    name: `${APP_NAME} Development`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER}.dev`,
    packageName: `${PACKAGE_NAME}.dev`,
    associatedDomain: `dev.${DOMAIN}`,
    scheme: `${SCHEME}-dev`,
  };
};
