import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPlaylist, setCurrentSong } from "@/store/player-slice";
import { getImageUrl, decodeHtml, songToQueueItem, truncate } from "@/utils";
import type { Song } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";
import AnimatedEqualizer from "./AnimatedEqualizer";

interface SongCardProps {
  song: Song;
  /** If provided, tapping will set the full list and play this index */
  allSongs?: Song[];
  index?: number;
  compact?: boolean;
}

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W * 0.38;

export default function SongCard({
  song,
  allSongs,
  index = 0,
  compact = false,
}: SongCardProps) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { isLiked, toggle } = useFavorites("track");
  const liked = isLiked(song.id);
  const playlist = useAppSelector((s) => s.player.playlist);
  const currentSong = useAppSelector((s) => s.player.currentSong);
  const playerIsPlaying = useAppSelector((s) => s.player.isPlaying);

  // Is this song the one currently loaded in the player?
  const isActive = playlist[currentSong]?.id === song.id;

  const imageUrl = getImageUrl(song.image);
  const title = decodeHtml(song.name);
  const artist =
    typeof song.primaryArtists === "string"
      ? decodeHtml(song.primaryArtists)
      : Array.isArray(song.primaryArtists)
      ? song.primaryArtists.map((a) => a.name).join(", ")
      : "";

  const handlePress = () => {
    if (allSongs) {
      dispatch(
        setPlaylist({
          playlist: allSongs.map(songToQueueItem),
          index,
        })
      );
    } else {
      const existing = playlist.findIndex((p) => p.id === song.id);
      if (existing >= 0) {
        dispatch(setCurrentSong(existing));
      } else {
        const item = songToQueueItem(song);
        dispatch(
          setPlaylist({
            playlist: [...playlist, item],
            index: playlist.length,
          })
        );
      }
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[
          styles.compactRow,
          { borderBottomColor: colors.border },
          isActive && {
            backgroundColor: colors.primary + "15", // faded primary tint
          },
        ]}
      >
        {/* Thumbnail with equalizer overlay when active */}
        <View>
          <Image source={{ uri: imageUrl }} style={styles.compactImage} />
          {isActive && (
            <View style={styles.equalizerOverlay}>
              <AnimatedEqualizer
                playing={playerIsPlaying}
                barCount={3}
                barWidth={3}
                barHeight={14}
                gap={2}
                color="#fff"
              />
            </View>
          )}
        </View>
        <View style={styles.compactInfo}>
          <Text
            style={[
              styles.compactTitle,
              { color: isActive ? colors.primary : colors.text },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text
            style={[styles.compactArtist, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {artist}
          </Text>
        </View>
        {isActive && (
          <AnimatedEqualizer
            playing={playerIsPlaying}
            barCount={4}
            barWidth={3}
            barHeight={16}
            gap={2}
          />
        )}
        <TouchableOpacity
          onPress={() => toggle(song.id)}
          hitSlop={8}
          style={isActive ? { marginLeft: Spacing.sm } : undefined}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={20}
            color={liked ? colors.danger : colors.textMuted}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.card, { width: CARD_W }]}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        {isActive ? (
          <View style={styles.playOverlayActive}>
            <AnimatedEqualizer
              playing={playerIsPlaying}
              barCount={4}
              barWidth={3}
              barHeight={18}
              gap={2}
              color="#fff"
            />
          </View>
        ) : (
          <View style={styles.playOverlay}>
            <Ionicons name="play" size={24} color="#fff" />
          </View>
        )}
      </View>
      <Text
        style={[
          styles.title,
          { color: isActive ? colors.primary : colors.text },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Text
        style={[styles.artist, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {truncate(artist, 30)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginRight: Spacing.md,
  },
  imageWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    aspectRatio: 1,
    marginBottom: Spacing.sm,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  playOverlayActive: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  equalizerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  artist: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  // Compact (list) style
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  compactImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  compactInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  compactTitle: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  compactArtist: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
});
