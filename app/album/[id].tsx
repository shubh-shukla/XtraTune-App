import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPlaylist } from "@/store/player-slice";
import AnimatedEqualizer from "@/components/common/AnimatedEqualizer";
import {
  getImageUrl,
  decodeHtml,
  formatDuration,
  songToQueueItem,
} from "@/utils";
import { fetchSongById } from "@/api";
import { useFavorites } from "@/hooks/useFavorites";
import api from "@/api/client";
import type { Song, Album } from "@/types";

const { width: SCREEN_W } = Dimensions.get("window");

export default function AlbumDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLiked, toggle } = useFavorites("track");
  const playerPlaylist = useAppSelector((s) => s.player.playlist);
  const currentSongIndex = useAppSelector((s) => s.player.currentSong);
  const playerIsPlaying = useAppSelector((s) => s.player.isPlaying);
  const currentSongId = playerPlaylist[currentSongIndex]?.id;

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await api.get(`/api/musicData`, {
          params: { type: "album", id },
        });
        setAlbum(data?.data ?? null);
      } catch {
        setAlbum(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handlePlayAll = () => {
    if (!album?.songs) return;
    dispatch(
      setPlaylist({
        playlist: album.songs.map(songToQueueItem),
        index: 0,
      })
    );
  };

  const handlePlaySong = (index: number) => {
    if (!album?.songs) return;
    dispatch(
      setPlaylist({
        playlist: album.songs.map(songToQueueItem),
        index,
      })
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 100 }}
        />
      </View>
    );
  }

  if (!album) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { paddingTop: insets.top + 10 }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Album not found
        </Text>
      </View>
    );
  }

  const coverUrl = getImageUrl(album.image);
  const songCount = album.songs?.length ?? album.songCount ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={album.songs ?? []}
        keyExtractor={(item, index) => `as-${item.id}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        ListHeaderComponent={
          <>
            <View style={styles.coverSection}>
              <Image source={{ uri: coverUrl }} style={styles.coverBg} blurRadius={30} />
              <LinearGradient
                colors={["transparent", colors.background]}
                style={styles.gradient}
              />
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.backBtnAbsolute, { top: insets.top + 10 }]}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Image source={{ uri: coverUrl }} style={styles.coverArt} />
              <Text style={[styles.albumTitle, { color: colors.text }]}>
                {decodeHtml(album.name)}
              </Text>
              <Text style={[styles.albumMeta, { color: colors.textSecondary }]}>
                {album.primaryArtists ? decodeHtml(album.primaryArtists) : ""}
                {album.year ? ` • ${album.year}` : ""}
                {songCount ? ` • ${songCount} songs` : ""}
              </Text>
              <TouchableOpacity
                onPress={handlePlayAll}
                style={[styles.playAllBtn, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="play" size={20} color="#fff" />
                <Text style={styles.playAllText}>Play All</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item, index }) => {
          const liked = isLiked(item.id);
          const isActive = item.id === currentSongId;
          const artist =
            typeof item.primaryArtists === "string" ? item.primaryArtists : "";
          return (
            <TouchableOpacity
              onPress={() => handlePlaySong(index)}
              activeOpacity={0.7}
              style={[
                styles.songRow,
                { borderBottomColor: colors.border },
                isActive && { backgroundColor: colors.primary + "15" },
              ]}
            >
              {isActive ? (
                <View style={styles.eqIndex}>
                  <AnimatedEqualizer
                    playing={playerIsPlaying}
                    barCount={3}
                    barWidth={2.5}
                    barHeight={14}
                    gap={1.5}
                  />
                </View>
              ) : (
                <Text style={[styles.songIndex, { color: colors.textMuted }]}>
                  {index + 1}
                </Text>
              )}
              <View>
                <Image
                  source={{ uri: getImageUrl(item.image, "low") }}
                  style={styles.songArt}
                />
                {isActive && (
                  <View style={styles.songArtOverlay}>
                    <AnimatedEqualizer
                      playing={playerIsPlaying}
                      barCount={3}
                      barWidth={2.5}
                      barHeight={12}
                      gap={1.5}
                      color="#fff"
                    />
                  </View>
                )}
              </View>
              <View style={styles.songInfo}>
                <Text
                  style={[styles.songTitle, { color: isActive ? colors.primary : colors.text }]}
                  numberOfLines={1}
                >
                  {decodeHtml(item.name)}
                </Text>
                <Text
                  style={[styles.songArtist, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {decodeHtml(artist)}
                </Text>
              </View>
              <Text style={[styles.songDuration, { color: colors.textMuted }]}>
                {formatDuration(item.duration)}
              </Text>
              <TouchableOpacity onPress={() => toggle(item.id)} hitSlop={8}>
                <Ionicons
                  name={liked ? "heart" : "heart-outline"}
                  size={20}
                  color={liked ? colors.danger : colors.textMuted}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    paddingTop: 0,
    paddingHorizontal: Spacing.lg,
  },
  backBtnAbsolute: {
    position: "absolute",
    top: 0,
    left: Spacing.lg,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: FontSize.base,
  },
  coverSection: {
    alignItems: "center",
    paddingBottom: Spacing.xl,
  },
  coverBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    opacity: 0.5,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 200,
    height: 100,
  },
  coverArt: {
    width: SCREEN_W * 0.55,
    height: SCREEN_W * 0.55,
    borderRadius: BorderRadius.xl,
    marginTop: 80,
  },
  albumTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    marginTop: Spacing.lg,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  albumMeta: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  playAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  playAllText: {
    color: "#fff",
    fontSize: FontSize.base,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  songIndex: {
    width: 24,
    fontSize: FontSize.sm,
    textAlign: "center",
  },
  eqIndex: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  songArt: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  songArtOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  songInfo: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  songTitle: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  songArtist: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  songDuration: {
    fontSize: FontSize.xs,
    marginRight: Spacing.sm,
  },
});
