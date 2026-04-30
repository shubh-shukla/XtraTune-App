import { useRef, useEffect, useCallback, useMemo } from "react";
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

export function useAudioPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const dispatch = useAppDispatch();
  const { playlist, currentSong, volume, autoplay, isPlaying } =
    useAppSelector((s) => s.player);
  const audioQuality = useAppSelector((s) => s.settings.audioQuality);

  const currentItem = playlist[currentSong];

  // Setup audio mode
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

  // Load and play when current song changes
  useEffect(() => {
    if (!currentItem?.id) return;

    let cancelled = false;

    (async () => {
      // Unload previous
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      dispatch(setIsBuffering(true));

      // Fetch full song data to get stream URL
      const song = await fetchSongById(currentItem.id);
      if (cancelled || !song) {
        dispatch(setIsBuffering(false));
        return;
      }

      const url = getStreamUrl(song.downloadUrl, audioQuality);
      if (!url || cancelled) {
        dispatch(setIsBuffering(false));
        return;
      }

      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true, volume },
          (status) => statusCallbackRef.current(status)
        );

        if (cancelled) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
        dispatch(setIsPlaying(true));
        dispatch(setIsBuffering(false));
      } catch (err) {
        console.warn("Audio load error:", err);
        dispatch(setIsBuffering(false));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentItem?.id, audioQuality]);

  // Volume changes
  useEffect(() => {
    soundRef.current?.setVolumeAsync(volume);
  }, [volume]);

  // Use a ref to always have the latest callback available to the Sound object
  const statusCallbackRef = useRef<(status: AVPlaybackStatus) => void>(() => {});

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;

      dispatch(setPositionMillis(status.positionMillis));
      if (status.durationMillis) {
        dispatch(setDurationMillis(status.durationMillis));
      }
      dispatch(setIsBuffering(status.isBuffering));

      if (status.didJustFinish) {
        handleTrackEnd();
      }
    },
    [playlist, currentSong, autoplay]
  );

  // Keep ref in sync
  useEffect(() => {
    statusCallbackRef.current = onPlaybackStatusUpdate;
  }, [onPlaybackStatusUpdate]);

  const handleTrackEnd = useCallback(async () => {
    if (currentSong < playlist.length - 1) {
      dispatch(nextTrack());
    } else if (autoplay && currentItem?.id) {
      // Fetch suggestions and append
      const suggestions = await fetchSuggestions(currentItem.id);
      if (suggestions.length > 0) {
        const newItems = suggestions.map(songToQueueItem);
        dispatch(appendToPlaylist(newItems));
        dispatch(setCurrentSong(playlist.length)); // first new item
      } else {
        dispatch(setCurrentSong(0)); // loop
      }
    } else {
      dispatch(setIsPlaying(false));
    }
  }, [currentSong, playlist, autoplay, currentItem]);

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
      dispatch(setIsPlaying(false));
    } else {
      await soundRef.current.playAsync();
      dispatch(setIsPlaying(true));
    }
  }, []);

  const seekTo = useCallback(async (millis: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(millis);
    dispatch(setPositionMillis(millis));
  }, []);

  const playNext = useCallback(() => {
    dispatch(nextTrack());
  }, []);

  const playPrev = useCallback(() => {
    dispatch(prevTrack());
  }, []);

  return {
    togglePlayPause,
    seekTo,
    playNext,
    playPrev,
    currentItem,
    soundRef,
  };
}
