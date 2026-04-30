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
import { useAppDispatch } from "@/store/hooks";
import { setPlaylist } from "@/store/player-slice";
import {
  getImageUrl,
  decodeHtml,
  formatDuration,
  songToQueueItem,
} from "@/utils";
import api from "@/api/client";
import AlbumCard from "@/components/common/AlbumCard";
import type { ArtistDetail, Song, Album } from "@/types";

const { width: SCREEN_W } = Dimensions.get("window");

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"songs" | "albums">("songs");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        // Fetch artist detail (includes topSongs) + albums separately
        const [detailRes, albumsRes] = await Promise.allSettled([
          api.get("/api/musicData", { params: { type: "artist", id } }),
          api.get("/api/artist/albums", { params: { id, page: 0, limit: 20 } }),
        ]);

        if (detailRes.status === "fulfilled") {
          const d = detailRes.value.data?.data;
          setArtist(d ?? null);
          setSongs(d?.topSongs ?? []);
        }
        if (albumsRes.status === "fulfilled") {
          setAlbums(albumsRes.value.data?.albums ?? albumsRes.value.data?.data?.results ?? []);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handlePlaySong = (index: number) => {
    dispatch(
      setPlaylist({
        playlist: songs.map(songToQueueItem),
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

  const imageUrl = getImageUrl(artist?.image);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={activeTab === "songs" ? songs : []}
        keyExtractor={(item, index) => `ar-${item.id}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        ListHeaderComponent={
          <>
            <View style={styles.heroSection}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.heroBg}
                blurRadius={40}
              />
              <LinearGradient
                colors={["transparent", colors.background]}
                style={styles.gradient}
              />
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.backBtn, { top: insets.top + 10 }]}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Image source={{ uri: imageUrl }} style={styles.artistImage} />
              <View style={styles.artistInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.artistName, { color: colors.text }]}>
                    {decodeHtml(artist?.name ?? "")}
                  </Text>
                  {artist?.isVerified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                      style={{ marginLeft: Spacing.xs }}
                    />
                  )}
                </View>
                <Text
                  style={[styles.followerCount, { color: colors.textSecondary }]}
                >
                  {artist?.followerCount
                    ? `${parseInt(artist.followerCount).toLocaleString()} followers`
                    : ""}
                  {songs.length > 0 ? ` • ${songs.length} songs` : ""}
                </Text>
              </View>
            </View>

            {/* Tabs */}
            <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => setActiveTab("songs")}
                style={[
                  styles.tab,
                  activeTab === "songs" && {
                    borderBottomColor: colors.primary,
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        activeTab === "songs"
                          ? colors.primary
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Songs
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("albums")}
                style={[
                  styles.tab,
                  activeTab === "albums" && {
                    borderBottomColor: colors.primary,
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        activeTab === "albums"
                          ? colors.primary
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Albums
                </Text>
              </TouchableOpacity>
            </View>

            {/* Albums grid */}
            {activeTab === "albums" && (
              <View style={styles.albumsGrid}>
                {albums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    item={album}
                    type="album"
                    width={(SCREEN_W - Spacing.lg * 3) / 2}
                  />
                ))}
              </View>
            )}
          </>
        }
        renderItem={
          activeTab === "songs"
            ? ({ item, index }) => {
                const artistStr =
                  typeof item.primaryArtists === "string"
                    ? item.primaryArtists
                    : "";
                return (
                  <TouchableOpacity
                    onPress={() => handlePlaySong(index)}
                    activeOpacity={0.7}
                    style={[
                      styles.songRow,
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    <Image
                      source={{
                        uri: getImageUrl(item.image, "low"),
                      }}
                      style={styles.songArt}
                    />
                    <View style={styles.songInfo}>
                      <Text
                        style={[styles.songTitle, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {decodeHtml(item.name)}
                      </Text>
                      <Text
                        style={[
                          styles.songArtist,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {decodeHtml(artistStr)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.songDuration,
                        { color: colors.textMuted },
                      ]}
                    >
                      {formatDuration(item.duration)}
                    </Text>
                  </TouchableOpacity>
                );
              }
            : () => null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: {
    alignItems: "center",
    paddingBottom: Spacing.lg,
  },
  heroBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    opacity: 0.4,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 200,
    height: 80,
  },
  backBtn: {
    position: "absolute",
    top: 54,
    left: Spacing.lg,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  artistImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginTop: 80,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  artistInfo: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  artistName: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
  },
  followerCount: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  tabText: {
    fontSize: FontSize.base,
    fontWeight: "600",
  },
  albumsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    justifyContent: "space-between",
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  songArt: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
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
  },
});
