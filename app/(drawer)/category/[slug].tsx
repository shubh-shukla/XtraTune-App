import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { fetchCategoryPlaylists, fetchCategorySongs } from "@/api";
import AlbumCard from "@/components/common/AlbumCard";
import SongCard from "@/components/common/SongCard";
import type { JioPlaylist, Song } from "@/types";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = (SCREEN_W - Spacing.lg * 3) / 2;

export default function CategoryDetailScreen() {
  const { slug, name } = useLocalSearchParams<{
    slug: string;
    name?: string;
  }>();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<"playlists" | "songs">(
    "playlists"
  );
  const [playlists, setPlaylists] = useState<JioPlaylist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const query = slug ? decodeURIComponent(slug) : "";

  const loadPlaylists = useCallback(
    async (pageNum: number) => {
      if (!query) return;
      const data = await fetchCategoryPlaylists(query, pageNum);
      if (data.results.length === 0) {
        setHasMore(false);
        return;
      }
      setPlaylists((prev) =>
        pageNum === 0 ? data.results : [...prev, ...data.results]
      );
    },
    [query]
  );

  const loadSongs = useCallback(async () => {
    if (!query) return;
    const data = await fetchCategorySongs(query, 0, 30);
    setSongs(data.results);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadPlaylists(0), loadSongs()]).finally(() =>
      setLoading(false)
    );
  }, [query]);

  const loadMore = () => {
    if (!hasMore || activeTab !== "playlists") return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadPlaylists(nextPage);
  };

  const displayName = name ? decodeURIComponent(name) : query;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 10 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {displayName}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab("playlists")}
          style={[
            styles.tab,
            activeTab === "playlists" && {
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
                  activeTab === "playlists"
                    ? colors.primary
                    : colors.textSecondary,
              },
            ]}
          >
            Playlists
          </Text>
        </TouchableOpacity>
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
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : activeTab === "playlists" ? (
        <FlatList
          key="playlists-grid"
          data={playlists}
          numColumns={2}
          keyExtractor={(item, index) => `cp-${item.id}-${index}`}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140, paddingTop: Spacing.md }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <AlbumCard item={item} type="playlist" width={CARD_W} />
          )}
        />
      ) : (
        <FlatList
          key="songs-list"
          data={songs}
          keyExtractor={(item, index) => `cs-${item.id}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
          renderItem={({ item, index }) => (
            <SongCard song={item} allSongs={songs} index={index} compact />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: "700",
    marginLeft: Spacing.md,
    marginRight: Spacing.md,
    textAlign: "center",
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
  gridRow: {
    paddingHorizontal: Spacing.lg,
    justifyContent: "space-between",
  },
});
