import type { ImageItem, Song, QueueItem, DownloadUrl } from "@/types";
import type { AudioQuality } from "@/store/settings-slice";

/**
 * Get the best quality image URL from an image array
 */
export function getImageUrl(
  images?: ImageItem[],
  quality: "low" | "medium" | "high" = "high"
): string {
  if (!images || images.length === 0) {
    return "https://via.placeholder.com/300x300.png?text=♪";
  }
  const qualityMap: Record<string, number> = {
    low: 0,
    medium: 1,
    high: images.length - 1,
  };
  const idx = qualityMap[quality] ?? images.length - 1;
  return images[Math.min(idx, images.length - 1)]?.link ?? images[0]?.link;
}

/**
 * Get the download URL for a given audio quality
 */
export function getStreamUrl(
  downloadUrls?: DownloadUrl[],
  quality: AudioQuality = "high"
): string | null {
  if (!downloadUrls || downloadUrls.length === 0) return null;

  const qualityMap: Record<AudioQuality, string> = {
    low: "48kbps",
    medium: "96kbps",
    high: "160kbps",
    extreme: "320kbps",
  };

  const target = qualityMap[quality];
  const match = downloadUrls.find((d) => d.quality === target);
  if (match) return match.link;

  // Fallback: highest available
  return downloadUrls[downloadUrls.length - 1]?.link ?? null;
}

/**
 * Convert Song to QueueItem
 */
export function songToQueueItem(song: Song): QueueItem {
  const artistStr =
    typeof song.primaryArtists === "string"
      ? song.primaryArtists
      : Array.isArray(song.primaryArtists)
      ? song.primaryArtists.map((a) => a.name).join(", ")
      : "";

  return {
    id: song.id,
    title: song.name,
    artist: artistStr,
    image: getImageUrl(song.image),
    duration: typeof song.duration === "string" ? parseInt(song.duration) : song.duration,
  };
}

/**
 * Format seconds to mm:ss
 */
export function formatDuration(seconds?: number | string): string {
  if (!seconds) return "0:00";
  const secs = typeof seconds === "string" ? parseInt(seconds) : seconds;
  if (isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Format milliseconds to mm:ss
 */
export function formatMillis(ms: number): string {
  return formatDuration(Math.floor(ms / 1000));
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, max: number): string {
  if (!str) return "";
  return str.length <= max ? str : str.slice(0, max) + "…";
}

/**
 * Decode HTML entities
 */
export function decodeHtml(str?: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

/**
 * Generate a greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}
