import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import MiniPlayer, { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "@/theme";

export default function SearchLayout() {
  const { colors } = useTheme();
  const hasPlaylist = useAppSelector((s) => s.player.playlist.length > 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Slot />
      {hasPlaylist && (
        <View style={styles.miniPlayer}>
          <MiniPlayer />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  miniPlayer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: MINI_PLAYER_HEIGHT,
    zIndex: 100,
  },
});
