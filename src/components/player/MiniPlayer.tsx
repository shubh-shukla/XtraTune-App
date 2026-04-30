import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { useAppSelector } from "@/store/hooks";
import { useAudioPlayerContext } from "@/hooks/AudioPlayerContext";
import { formatMillis, truncate } from "@/utils";

const { width: SCREEN_W } = Dimensions.get("window");
const BAR_HEIGHT = 64;

/**
 * Mini player bar shown at the bottom of every screen
 */
export default function MiniPlayer() {
  const { colors } = useTheme();
  const router = useRouter();
  const { togglePlayPause, playNext } = useAudioPlayerContext();
  const { isPlaying, positionMillis, durationMillis, isBuffering, playlist, currentSong } =
    useAppSelector((s) => s.player);
  const currentItem = playlist[currentSong];

  if (!currentItem || playlist.length === 0) return null;

  const progress =
    durationMillis > 0 ? positionMillis / durationMillis : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => router.push("/player")}
      style={[
        styles.container,
        {
          backgroundColor: colors.playerBackground,
          borderTopColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
      ]}
    >
      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${progress * 100}%`,
            },
          ]}
        />
      </View>

      <View style={styles.content}>
        {/* Artwork */}
        <Image
          source={{
            uri: currentItem.image || "https://via.placeholder.com/48",
          }}
          style={styles.artwork}
        />

        {/* Song info */}
        <View style={styles.info}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {currentItem.title ?? "Unknown"}
          </Text>
          <Text
            style={[styles.artist, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {currentItem.artist ?? ""}
          </Text>
        </View>

        {/* Controls */}
        <TouchableOpacity
          onPress={togglePlayPause}
          hitSlop={12}
          style={styles.controlBtn}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={26}
            color={colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={playNext}
          hitSlop={12}
          style={styles.controlBtn}
        >
          <Ionicons name="play-forward" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: BAR_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 50,
  },
  progressTrack: {
    height: 2,
    width: "100%",
  },
  progressFill: {
    height: 2,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  artist: {
    fontSize: FontSize.xs,
    marginTop: 1,
  },
  controlBtn: {
    padding: Spacing.sm,
  },
});

export { BAR_HEIGHT as MINI_PLAYER_HEIGHT };
