import axios, { InternalAxiosRequestConfig } from "axios";
import { getBackendUrl } from "./urlConfig";
import { getSupabaseClient } from "@/hooks/supabaseClient";

const url = getBackendUrl();
const axiosConfig = axios.create({ baseURL: url });
const supabase = getSupabaseClient();

const requestInterceptor = async (config: InternalAxiosRequestConfig) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = "Bearer " + session.access_token;
  }
  return config;
};

axiosConfig.interceptors.request.use(requestInterceptor);

export default axiosConfig;
