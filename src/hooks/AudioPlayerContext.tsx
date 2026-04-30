import React, { createContext, useContext, useRef, useEffect, useCallback } from "react";
import { Audio, type AVPlaybackStatus } from "expo-av";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setIsPlaying,
  setPositionMillis,
  setDurationMillis,
  setIsBuffering,
  nextTrack,
  prevTrack,
  appendToPlaylist,
  setCurrentSong,
} from "@/store/player-slice";
import { fetchSongById, fetchSuggestions } from "@/api";
import { getStreamUrl, songToQueueItem } from "@/utils";

/* ---- module-level seeking flag (no re-renders) ---- */
let _isSeeking = false;
export function setIsSeeking(v: boolean) {
  _isSeeking = v;
}

/* ---- context shape ---- */
interface AudioPlayerAPI {
  togglePlayPause: () => Promise<void>;
  seekTo: (millis: number) => Promise<void>;
  playNext: () => void;
  playPrev: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerAPI>({
  togglePlayPause: async () => {},
  seekTo: async () => {},
  playNext: () => {},
  playPrev: () => {},
});

export const useAudioPlayerContext = () => useContext(AudioPlayerContext);

/**
 * Singleton audio player provider – mount ONCE in root layout.
 * Manages one Audio.Sound instance for the entire app.
 */
export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const dispatch = useAppDispatch();
  const { playlist, currentSong, volume, autoplay, repeat } =
    useAppSelector((s) => s.player);
  const audioQuality = useAppSelector((s) => s.settings.audioQuality);

  const currentItem = playlist[currentSong];

  // Keep latest values in refs so callbacks never go stale
  const playlistRef = useRef(playlist);
  const currentSongRef = useRef(currentSong);
  const autoplayRef = useRef(autoplay);
  const currentItemRef = useRef(currentItem);
  const repeatRef = useRef(repeat);
  playlistRef.current = playlist;
  currentSongRef.current = currentSong;
  autoplayRef.current = autoplay;
  currentItemRef.current = currentItem;
  repeatRef.current = repeat;
  currentItemRef.current = currentItem;

  // Audio mode – once
  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  // ---- track-end logic ----
  const handleTrackEnd = useCallback(async () => {
    const cs = currentSongRef.current;
    const pl = playlistRef.current;
    const ap = autoplayRef.current;
    const ci = currentItemRef.current;
    const rep = repeatRef.current;

    // Repeat-one: replay the same track
    if (rep === "one") {
      if (soundRef.current) {
        try {
          await soundRef.current.setPositionAsync(0);
          await soundRef.current.playAsync();
          dispatch(setIsPlaying(true));
        } catch { /* unloaded */ }
      }
      return;
    }

    if (cs < pl.length - 1) {
      dispatch(nextTrack());
    } else if (rep === "all") {
      // Repeat-all: loop back to first track
      dispatch(setCurrentSong(0));
    } else if (ap && ci?.id) {
      try {
        const suggestions = await fetchSuggestions(ci.id);
        if (suggestions.length > 0) {
          const newItems = suggestions.map(songToQueueItem);
          dispatch(appendToPlaylist(newItems));
          dispatch(setCurrentSong(pl.length));
        } else {
          dispatch(setCurrentSong(0));
        }
      } catch {
        dispatch(setIsPlaying(false));
      }
    } else {
      dispatch(setIsPlaying(false));
    }
  }, [dispatch]);

  // ---- playback status callback (stable ref) ----
  const statusCb = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    if (!_isSeeking) {
      dispatch(setPositionMillis(status.positionMillis));
    }
    if (status.durationMillis) {
      dispatch(setDurationMillis(status.durationMillis));
    }
    dispatch(setIsBuffering(status.isBuffering));

    if (status.didJustFinish) {
      handleTrackEnd();
    }
  }, [dispatch, handleTrackEnd]);

  // Keep a ref so Sound always calls the latest closure
  const statusCbRef = useRef(statusCb);
  statusCbRef.current = statusCb;

  // ---- load & play when song changes ----
  useEffect(() => {
    if (!currentItem?.id) return;
    let cancelled = false;

    (async () => {
      // Unload previous
      if (soundRef.current) {
        try { await soundRef.current.stopAsync(); } catch { /* ok */ }
        try { await soundRef.current.unloadAsync(); } catch { /* ok */ }
        soundRef.current = null;
      }

      dispatch(setIsBuffering(true));
      dispatch(setPositionMillis(0));
      dispatch(setDurationMillis(0));

      const song = await fetchSongById(currentItem.id);
      if (cancelled || !song) { dispatch(setIsBuffering(false)); return; }

      const url = getStreamUrl(song.downloadUrl, audioQuality);
      if (!url || cancelled) { dispatch(setIsBuffering(false)); return; }

      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true, volume },
          (s) => statusCbRef.current(s),
        );
        if (cancelled) { await sound.unloadAsync(); return; }
        soundRef.current = sound;
        dispatch(setIsPlaying(true));
        dispatch(setIsBuffering(false));
      } catch (err) {
        console.warn("Audio load error:", err);
        dispatch(setIsBuffering(false));
      }
    })();

    return () => { cancelled = true; };
  }, [currentItem?.id, audioQuality]);

  // Volume sync
  useEffect(() => { soundRef.current?.setVolumeAsync(volume).catch(() => {}); }, [volume]);

  // ---- public API ----
  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        dispatch(setIsPlaying(false));
      } else {
        await soundRef.current.playAsync();
        dispatch(setIsPlaying(true));
      }
    } catch { /* unloaded */ }
  }, [dispatch]);

  const seekTo = useCallback(async (millis: number) => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.setPositionAsync(millis);
      dispatch(setPositionMillis(millis));
    } catch { /* ignore */ }
  }, [dispatch]);

  const playNext = useCallback(() => { dispatch(nextTrack()); }, [dispatch]);
  const playPrev = useCallback(() => { dispatch(prevTrack()); }, [dispatch]);

  const api: AudioPlayerAPI = React.useMemo(
    () => ({ togglePlayPause, seekTo, playNext, playPrev }),
    [togglePlayPause, seekTo, playNext, playPrev],
  );

  return (
    <AudioPlayerContext.Provider value={api}>
      {children}
    </AudioPlayerContext.Provider>
  );
}
