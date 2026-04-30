import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Base URL for the XtraTune Next.js backend
// In production, point this to your deployed backend
// Use your machine's LAN IP so the mobile device/simulator can reach it
import Constants from "expo-constants";

const DEV_HOST =
  Constants.expoConfig?.hostUri?.split(":")[0] ??
  process.env.EXPO_PUBLIC_DEV_HOST_FALLBACK ??
  "localhost";

const DEV_PORT = process.env.EXPO_PUBLIC_DEV_PORT ?? "3000";

const API_BASE = !__DEV__
  ? `http://${DEV_HOST}:${DEV_PORT}` // local dev – uses LAN IP from Expo
  : process.env.EXPO_PUBLIC_API_URL ?? ""; // production URL

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach auth token if available
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("xt_token");
    if (token) {
      config.headers["Cookie"] = `xt_session=${token}`;
    }
    // CSRF token
    const csrf = await SecureStore.getItemAsync("xt_csrf");
    if (csrf) {
      config.headers["x-csrf-token"] = csrf;
    }
  } catch {
    // secure store not available
  }
  return config;
});

export default api;
export { API_BASE };
