import dotenv from "dotenv/config";

export default {
  expo: {
    name: "speaksers-mobile",
    slug: "speaksers-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/react-logo@2x.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/react-logo@3x.png",
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
      package: "com.speaksers.speaksers-app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: ["android.permission.RECORD_AUDIO"],
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
        projectId: "e0729a28-a1b5-4a64-956b-e9058e95c178",
      },
      SUPABASE_AUTH_URL: process.env.SUPABASE_AUTH_URL,
      SUPABASE_AUTH_API_KEY: process.env.SUPABASE_AUTH_API_KEY,
      GOOGLE_AUTH_CLIENT_ID: process.env.GOOGLE_AUTH_CLIENT_ID,
      BACKEND_URL: process.env.BACKEND_URL,
      BACKEND_URL_LOCAL: process.env.BACKEND_URL_LOCAL,
      SB_AUTH_TOKEN_NAME: process.env.SB_AUTH_TOKEN_NAME,
      STUN_SERVERS_URL: process.env.STUN_SERVERS_URL,
    },
    owner: "mariusuktveris",
  },
  // expo: {
  //   extra: {
  //     SUPABASE_AUTH_URL: process.env.SUPABASE_AUTH_URL,
  //     SUPABASE_AUTH_API_KEY: process.env.SUPABASE_AUTH_API_KEY,
  //     GOOGLE_AUTH_CLIENT_ID: process.env.GOOGLE_AUTH_CLIENT_ID,
  //     BACKEND_URL: process.env.BACKEND_URL,
  //     BACKEND_URL_LOCAL: process.env.BACKEND_URL_LOCAL,
  //     SB_AUTH_TOKEN_NAME: process.env.SB_AUTH_TOKEN_NAME,
  //     STUN_SERVERS_URL: process.env.STUN_SERVERS_URL,
  //   },
  //   scheme: "speaksers",
  // },
};
