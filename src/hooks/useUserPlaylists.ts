import { useState, useEffect, useCallback } from "react";
import {
  fetchUserPlaylists,
  createUserPlaylist,
  deleteUserPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from "@/api";
import type { UserPlaylist } from "@/types";
import { useAuth } from "./useAuth";

export function useUserPlaylists() {
  const { isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await fetchUserPlaylists();
      setPlaylists(data);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (name: string, description?: string) => {
      const p = await createUserPlaylist(name, description);
      if (p) {
        setPlaylists((prev) => [p, ...prev]);
      }
      return p;
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    const ok = await deleteUserPlaylist(id);
    if (ok) {
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
    }
    return ok;
  }, []);

  const addSong = useCallback(
    async (
      playlistId: string,
      song: {
        id: string;
        title: string;
        artist: string;
        image: string;
        duration: number;
      }
    ) => {
      return addSongToPlaylist(playlistId, song);
    },
    []
  );

  const removeSong = useCallback(
    async (playlistId: string, songId: string) => {
      return removeSongFromPlaylist(playlistId, songId);
    },
    []
  );

  return {
    playlists,
    loading,
    refresh,
    create,
    remove,
    addSong,
    removeSong,
    needsAuth: !isAuthenticated,
  };
}
