import dotenv from "dotenv/config";

export default {
  expo: {
    extra: {
      SUPABASE_AUTH_URL: process.env.SUPABASE_AUTH_URL,
      SUPABASE_AUTH_API_KEY: process.env.SUPABASE_AUTH_API_KEY,
      GOOGLE_AUTH_CLIENT_ID: process.env.GOOGLE_AUTH_CLIENT_ID,
      BACKEND_URL: process.env.BACKEND_URL,
      BACKEND_URL_LOCAL: process.env.BACKEND_URL_LOCAL,
      SB_AUTH_TOKEN_NAME: process.env.SB_AUTH_TOKEN_NAME,
      STUN_SERVERS_URL: process.env.STUN_SERVERS_URL,
    },
    scheme: "speaksers",
  },
};
