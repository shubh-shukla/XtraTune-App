import { useState, useEffect, useCallback } from "react";
import { fetchFavorites, toggleFavorite } from "@/api";
import { useAuth } from "./useAuth";
import { useLoginPrompt } from "@/components/common/LoginPromptProvider";

export function useFavorites(entityType: "track" | "album" | "playlist") {
  const { isAuthenticated } = useAuth();
  const { showLoginPrompt } = useLoginPrompt();
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIds([]);
      return;
    }
    setLoading(true);
    fetchFavorites(entityType)
      .then(setIds)
      .finally(() => setLoading(false));
  }, [isAuthenticated, entityType]);

  const toggle = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        showLoginPrompt();
        return;
      }
      // Optimistic update
      setIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
      try {
        await toggleFavorite(entityType, id);
      } catch {
        // Rollback
        setIds((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
      }
    },
    [isAuthenticated, entityType, showLoginPrompt]
  );

  const isLiked = useCallback(
    (id: string) => ids.includes(id),
    [ids]
  );

  return { ids, isLiked, toggle, loading, needsAuth: !isAuthenticated };
}
