import api from "./client";
import type {
  Song,
  HomepageData,
  SearchSuggestions,
  SearchData,
  Album,
  JioPlaylist,
  ArtistDetail,
  LyricsData,
  StationSection,
  UserPlaylist,
  SessionPayload,
} from "@/types";

// ─── Music Data ────────────────────────────────────

/** Fetch song details by ID */
export async function fetchSongById(id: string): Promise<Song | null> {
  try {
    const { data } = await api.post("/api/musicData", { id });
    const songs = data?.data;
    return Array.isArray(songs) ? songs[0] : songs;
  } catch {
    return null;
  }
}

/** Fetch homepage data (trending, albums, playlists, charts) */
export async function fetchHomepage(): Promise<HomepageData | null> {
  try {
    const { data } = await api.get("/api/trending");
    return data?.data ?? data;
  } catch {
    return null;
  }
}

/** Fetch search suggestions (typeahead) */
export async function fetchSearchSuggestions(
  query: string
): Promise<SearchSuggestions | null> {
  try {
    const { data } = await api.get("/api/search/suggestions", {
      params: { q: query },
    });
    return data?.data ?? data;
  } catch {
    return null;
  }
}

/** Fetch full search results for a query */
export async function fetchSearchResults(
  query: string
): Promise<SearchData | null> {
  try {
    const { data } = await api.get("/api/search/results", {
      params: { q: query },
    });
    return data?.data ?? data;
  } catch {
    return null;
  }
}

/** Fetch trending search items */
export async function fetchTrendingSearch(): Promise<any[]> {
  try {
    const { data } = await api.get("/api/search/trending");
    return data?.data ?? data ?? [];
  } catch {
    return [];
  }
}

/** Fetch album details */
export async function fetchAlbum(id: string): Promise<Album | null> {
  try {
    const { data } = await api.get(`/api/musicData`, {
      params: { type: "album", id },
    });
    // Fallback: the web app fetches directly from scraper
    return data?.data ?? null;
  } catch {
    return null;
  }
}

/** Fetch playlist details */
export async function fetchPlaylist(id: string): Promise<JioPlaylist | null> {
  try {
    const { data } = await api.get("/api/musicData", {
      params: { type: "playlist", id },
    });
    return data?.data ?? null;
  } catch {
    return null;
  }
}

/** Fetch artist details */
export async function fetchArtistDetail(
  id: string
): Promise<ArtistDetail | null> {
  try {
    const { data } = await api.get("/api/musicData", {
      params: { type: "artist", id },
    });
    return data?.data ?? null;
  } catch {
    return null;
  }
}

/** Fetch artist songs (paginated) */
export async function fetchArtistSongs(
  id: string,
  page = 0,
  limit = 20
): Promise<{ total: number; results: Song[] }> {
  try {
    const { data } = await api.get("/api/artist/albums", {
      params: { id, page, limit },
    });
    return data?.data ?? { total: 0, results: [] };
  } catch {
    return { total: 0, results: [] };
  }
}

/** Fetch song suggestions (autoplay) */
export async function fetchSuggestions(songId: string): Promise<Song[]> {
  try {
    const { data } = await api.get("/api/suggestions", {
      params: { id: songId },
    });
    return data?.data ?? [];
  } catch {
    return [];
  }
}

/** Fetch lyrics */
export async function fetchLyrics(
  songId: string
): Promise<LyricsData | null> {
  try {
    const { data } = await api.get("/api/lyrics", {
      params: { id: songId },
    });
    return data?.data ?? data;
  } catch {
    return null;
  }
}

/** Fetch radio stations */
export async function fetchStations(): Promise<StationSection[]> {
  try {
    const { data } = await api.get("/api/stations");
    return data?.data ?? data ?? [];
  } catch {
    return [];
  }
}

/** Fetch category playlists */
export async function fetchCategoryPlaylists(
  query: string,
  page = 0,
  limit = 20
): Promise<{ results: JioPlaylist[]; total?: number }> {
  try {
    const { data } = await api.get("/api/categories/playlists", {
      params: { query, page, limit },
    });
    // Backend returns { data: [...] } — wrap into { results: [...] }
    const arr = Array.isArray(data?.data) ? data.data : [];
    return { results: arr };
  } catch {
    return { results: [] };
  }
}

/** Fetch category songs */
export async function fetchCategorySongs(
  query: string,
  page = 0,
  limit = 20
): Promise<{ results: Song[]; total?: number }> {
  try {
    const { data } = await api.get("/api/categories/songs", {
      params: { query, page, limit },
    });
    // Backend returns { data: [...] } — wrap into { results: [...] }
    const arr = Array.isArray(data?.data) ? data.data : [];
    return { results: arr };
  } catch {
    return { results: [] };
  }
}

// ─── User / Auth ───────────────────────────────────

/** Get current user session */
export async function fetchCurrentUser(): Promise<SessionPayload | null> {
  try {
    const { data } = await api.get("/api/user/me");
    return data?.user ?? null;
  } catch {
    return null;
  }
}

/** Logout */
export async function logout(): Promise<void> {
  try {
    await api.post("/api/user/logout");
  } catch {}
}

/** Get CSRF token */
export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const { data } = await api.get("/api/csrf");
    return data?.csrfToken ?? null;
  } catch {
    return null;
  }
}

// ─── Favorites ─────────────────────────────────────

/** Fetch favorite IDs by type */
export async function fetchFavorites(
  type: "track" | "album" | "playlist"
): Promise<string[]> {
  try {
    const { data } = await api.get("/api/user/favorites", {
      params: { type },
    });
    return data?.ids ?? [];
  } catch {
    return [];
  }
}

/** Toggle favorite */
export async function toggleFavorite(
  entityType: "track" | "album" | "playlist",
  entityId: string
): Promise<boolean> {
  try {
    const { data } = await api.post("/api/user/favorites", {
      entityType,
      entityId,
    });
    return data?.liked ?? false;
  } catch {
    return false;
  }
}

// ─── User Playlists ────────────────────────────────

/** List all user playlists */
export async function fetchUserPlaylists(): Promise<UserPlaylist[]> {
  try {
    const { data } = await api.get("/api/playlists");
    return data?.playlists ?? [];
  } catch {
    return [];
  }
}

/** Get single user playlist */
export async function fetchUserPlaylist(
  id: string
): Promise<UserPlaylist | null> {
  try {
    const { data } = await api.get(`/api/playlists/${id}`);
    return data?.playlist ?? data ?? null;
  } catch {
    return null;
  }
}

/** Create user playlist */
export async function createUserPlaylist(
  name: string,
  description?: string
): Promise<UserPlaylist | null> {
  try {
    const { data } = await api.post("/api/playlists", { name, description });
    return data?.playlist ?? data ?? null;
  } catch {
    return null;
  }
}

/** Delete user playlist */
export async function deleteUserPlaylist(id: string): Promise<boolean> {
  try {
    await api.delete(`/api/playlists/${id}`);
    return true;
  } catch {
    return false;
  }
}

/** Add song to user playlist */
export async function addSongToPlaylist(
  playlistId: string,
  song: { id: string; title: string; artist: string; image: string; duration: number }
): Promise<boolean> {
  try {
    await api.post(`/api/playlists/${playlistId}/songs`, song);
    return true;
  } catch {
    return false;
  }
}

/** Remove song from user playlist */
export async function removeSongFromPlaylist(
  playlistId: string,
  songId: string
): Promise<boolean> {
  try {
    await api.delete(`/api/playlists/${playlistId}/songs`, {
      params: { songId },
    });
    return true;
  } catch {
    return false;
  }
}

// ─── Playback State Sync ──────────────────────────

/** Fetch saved playback state */
export async function fetchPlaybackState(): Promise<{
  songId: string;
  position: number;
  playlist: any[];
  currentIndex: number;
} | null> {
  try {
    const { data } = await api.get("/api/user/playback");
    return data?.playback ?? null;
  } catch {
    return null;
  }
}

/** Save playback state */
export async function savePlaybackState(state: {
  songId: string;
  position: number;
  playlist: any[];
  currentIndex: number;
}): Promise<boolean> {
  try {
    await api.put("/api/user/playback", state);
    return true;
  } catch {
    return false;
  }
}
