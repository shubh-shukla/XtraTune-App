import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { fetchCurrentUser } from "@/api";
import type { SessionPayload } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const u = await fetchCurrentUser();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const signOut = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync("xt_token");
      await SecureStore.deleteItemAsync("xt_csrf");
    } catch {}
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    loading,
    checkAuth,
    signOut,
  };
}
