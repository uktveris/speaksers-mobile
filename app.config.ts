import "dotenv/config";

export default {
  expo: {
    name: "speaksers-mobile",
    slug: "speaksers-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "speaksers",
    deepLinking: true,
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/icon.png",
      imageWidth: 300,
      resizeMode: "cover",
      backgroundColor: "#FF0000",
    },
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.speaksers.speaksers-app",
      infoPlist: {
        UIBackgroundModes: ["audio"],
        NSMicrophoneUsageDescription:
          "This app uses microphone for audio calls.",
      },
    },
    android: {
      package: "com.speaksers.speaksersapp",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.INTERNET",
      ],
    },
    // web: {
    //   bundler: "metro",
    //   output: "static",
    //   favicon: "./assets/images/favicon.png",
    // },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/react-logo@3x.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-localization",
      "@config-plugins/react-native-webrtc",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "2b1aea07-cf67-4902-8f35-ac16d83e6099",
      },
      SUPABASE_AUTH_URL: process.env.SUPABASE_AUTH_URL,
      SUPABASE_AUTH_API_KEY: process.env.SUPABASE_AUTH_API_KEY,
      BACKEND_URL: process.env.BACKEND_URL,
      BACKEND_URL_LOCAL: process.env.BACKEND_URL_LOCAL,
      SB_AUTH_TOKEN_NAME: process.env.SB_AUTH_TOKEN_NAME,
      DEFAULT_AVATAR_URL: process.env.DEFAULT_AVATAR_URL,
    },
    owner: "mariusuktveris",
  },
};
