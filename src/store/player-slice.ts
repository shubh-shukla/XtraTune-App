import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { QueueItem } from "@/types";

export type { QueueItem as Playlist };

export type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  playlist: QueueItem[];
  currentSong: number;
  volume: number;
  autoplay: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  isBuffering: boolean;
}

const initialState: PlayerState = {
  playlist: [],
  currentSong: 0,
  volume: 1.0,
  autoplay: true,
  shuffle: false,
  repeat: "off",
  isPlaying: false,
  positionMillis: 0,
  durationMillis: 0,
  isBuffering: false,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlaylist(
      state,
      action: PayloadAction<{ playlist: QueueItem[]; index?: number }>
    ) {
      state.playlist = action.payload.playlist;
      if (action.payload.index !== undefined) {
        state.currentSong = action.payload.index;
      }
    },
    setCurrentSong(state, action: PayloadAction<number>) {
      state.currentSong = action.payload;
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = action.payload;
    },
    toggleAutoplay(state) {
      state.autoplay = !state.autoplay;
    },
    toggleShuffle(state) {
      state.shuffle = !state.shuffle;
    },
    cycleRepeat(state) {
      const modes: RepeatMode[] = ["off", "all", "one"];
      const idx = modes.indexOf(state.repeat);
      state.repeat = modes[(idx + 1) % modes.length];
    },
    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    setPositionMillis(state, action: PayloadAction<number>) {
      state.positionMillis = action.payload;
    },
    setDurationMillis(state, action: PayloadAction<number>) {
      state.durationMillis = action.payload;
    },
    setIsBuffering(state, action: PayloadAction<boolean>) {
      state.isBuffering = action.payload;
    },
    appendToPlaylist(state, action: PayloadAction<QueueItem[]>) {
      const existingIds = new Set(state.playlist.map((s) => s.id));
      const newSongs = action.payload.filter((s) => !existingIds.has(s.id));
      state.playlist.push(...newSongs);
    },
    removeAt(state, action: PayloadAction<number>) {
      const index = action.payload;
      if (index < 0 || index >= state.playlist.length) return;
      const nextList = state.playlist.filter((_, i) => i !== index);
      let nextCurrent = state.currentSong;
      if (state.playlist.length === 1) {
        nextCurrent = 0;
      } else if (index < state.currentSong) {
        nextCurrent = state.currentSong - 1;
      } else if (index === state.currentSong) {
        nextCurrent = index >= nextList.length ? nextList.length - 1 : index;
      }
      state.playlist = nextList;
      state.currentSong = Math.max(0, nextCurrent);
    },
    updateMeta(
      state,
      action: PayloadAction<{ index: number; meta: Partial<QueueItem> }>
    ) {
      const { index, meta } = action.payload;
      if (index < 0 || index >= state.playlist.length) return;
      state.playlist[index] = { ...state.playlist[index], ...meta };
    },
    nextTrack(state) {
      if (state.playlist.length === 0) return;
      if (state.shuffle) {
        let rand = Math.floor(Math.random() * state.playlist.length);
        if (rand === state.currentSong && state.playlist.length > 1) {
          rand = (rand + 1) % state.playlist.length;
        }
        state.currentSong = rand;
      } else {
        state.currentSong = (state.currentSong + 1) % state.playlist.length;
      }
    },
    prevTrack(state) {
      if (state.playlist.length === 0) return;
      state.currentSong =
        state.currentSong === 0
          ? state.playlist.length - 1
          : state.currentSong - 1;
    },
  },
});

export const {
  setPlaylist,
  setCurrentSong,
  setVolume,
  toggleAutoplay,
  toggleShuffle,
  cycleRepeat,
  setIsPlaying,
  setPositionMillis,
  setDurationMillis,
  setIsBuffering,
  appendToPlaylist,
  removeAt,
  updateMeta,
  nextTrack,
  prevTrack,
} = playerSlice.actions;

export default playerSlice.reducer;
