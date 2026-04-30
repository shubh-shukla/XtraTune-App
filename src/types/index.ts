// ─── Image ───────────────────────────────────────────
export interface ImageItem {
  quality: string;
  link: string;
}

// ─── Download URL ────────────────────────────────────
export interface DownloadUrl {
  quality: string; // "12kbps" | "48kbps" | "96kbps" | "160kbps" | "320kbps"
  link: string;
}

// ─── Artist ──────────────────────────────────────────
export interface Artist {
  id: string;
  name: string;
  url?: string;
  image?: ImageItem[];
  type?: string;
  role?: string;
}

// ─── Song ────────────────────────────────────────────
export interface Song {
  id: string;
  name: string;
  type?: string;
  album?: { id: string; name: string; url?: string };
  year?: string;
  releaseDate?: string;
  duration?: string | number;
  label?: string;
  primaryArtists?: string | PrimaryArtist[];
  primaryArtistsId?: string;
  featuredArtists?: string;
  featuredArtistsId?: string;
  explicitContent?: string;
  playCount?: string;
  language?: string;
  hasLyrics?: string;
  url?: string;
  copyright?: string;
  image?: ImageItem[];
  downloadUrl?: DownloadUrl[];
}

export interface PrimaryArtist {
  id: string;
  name: string;
  url?: string;
  image?: ImageItem[];
  type?: string;
  role?: string;
}

// ─── Album ───────────────────────────────────────────
export interface Album {
  id: string;
  name: string;
  year?: string;
  type?: string;
  playCount?: string;
  language?: string;
  explicitContent?: string;
  songCount?: string | number;
  url?: string;
  primaryArtists?: string;
  featuredArtists?: string;
  artists?: Artist[];
  image?: ImageItem[];
  songs?: Song[];
  releaseDate?: string;
}

// ─── Playlist (JioSaavn) ────────────────────────────
export interface JioPlaylist {
  id: string;
  userId?: string;
  name?: string;
  title?: string;
  subtitle?: string;
  type?: string;
  image?: ImageItem[];
  url?: string;
  songCount?: number;
  firstname?: string;
  followerCount?: string;
  lastUpdated?: string;
  explicitContent?: string;
  songs?: Song[];
}

// ─── Chart ───────────────────────────────────────────
export interface Chart {
  id: string;
  title: string;
  subtitle?: string;
  type?: string;
  image?: ImageItem[];
  url?: string;
  firstname?: string;
  explicitContent?: string;
  language?: string;
}

// ─── Homepage Response ───────────────────────────────
export interface HomepageData {
  albums: Album[];
  playlists: JioPlaylist[];
  charts: Chart[];
  trending: {
    songs: Song[];
    albums: Album[];
  };
}

// ─── Search Types ────────────────────────────────────
export interface SearchResult {
  id: string;
  title: string;
  image?: ImageItem[] | string;
  album?: string;
  url?: string;
  type?: string;
  description?: string;
  position?: number;
  primaryArtists?: string;
  singers?: string;
  language?: string;
  artist?: string;
  year?: string;
}

export interface SearchSuggestions {
  topResult?: SearchResult[];
  albums?: SearchResult[];
  songs?: SearchResult[];
  artists?: SearchResult[];
  playlists?: SearchResult[];
}

export interface SearchData {
  topQuery?: { results: SearchResult[] };
  songs?: { results: SearchResult[] };
  albums?: { results: SearchResult[] };
  artists?: { results: SearchResult[] };
  playlists?: { results: SearchResult[] };
}

// ─── Artist Detail ───────────────────────────────────
export interface ArtistDetail {
  id: string;
  name: string;
  url?: string;
  image?: ImageItem[];
  followerCount?: string;
  fanCount?: string;
  isVerified?: boolean;
  dominantLanguage?: string;
  dominantType?: string;
  bio?: { text?: string; title?: string; sequence?: number }[];
  dob?: string;
  fb?: string;
  twitter?: string;
  wiki?: string;
  availableLanguages?: string[];
  isRadioPresent?: boolean;
}

// ─── User Playlist ───────────────────────────────────
export interface UserPlaylistSong {
  id: string;
  title: string;
  artist: string;
  image: string;
  duration: number;
  addedAt: string;
}

export interface UserPlaylist {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  songCount: number;
  songs: UserPlaylistSong[];
  createdAt: string;
  updatedAt: string;
}

// ─── Lyrics ──────────────────────────────────────────
export interface LyricsData {
  lyrics: string;
  snippet?: string;
  copyright?: string;
  hasLyrics?: boolean;
}

// ─── Station / Radio ─────────────────────────────────
export interface StationSection {
  title: string;
  emoji: string;
  stations: StationItem[];
}

export interface StationItem {
  id: string;
  name: string;
  image?: ImageItem[];
  songCount?: number;
  followerCount?: string;
}

// ─── Player Queue Item (Redux) ──────────────────────
export interface QueueItem {
  id: string;
  title?: string;
  artist?: string;
  image?: string;
  duration?: number;
}

// ─── Auth ────────────────────────────────────────────
export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  image?: string;
  provider: string;
}
