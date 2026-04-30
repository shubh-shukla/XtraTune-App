import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { fetchSearchResults } from "@/api";
import { getImageUrl, decodeHtml, songToQueueItem } from "@/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPlaylist, setCurrentSong } from "@/store/player-slice";
import SongCard from "@/components/common/SongCard";
import AlbumCard from "@/components/common/AlbumCard";
import { HorizontalList, SectionHeader } from "@/components/common/SectionList";
import type { SearchData, SearchResult } from "@/types";

const { width: SCREEN_W } = Dimensions.get("window");

export default function SearchResultsScreen() {
  const insets = useSafeAreaInsets();
  const { query } = useLocalSearchParams<{ query: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const playlist = useAppSelector((s) => s.player.playlist);

  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetchSearchResults(decodeURIComponent(query))
      .then(setData)
      .finally(() => setLoading(false));
  }, [query]);

  const handleSongPress = (item: SearchResult) => {
    const existing = playlist.findIndex((p) => p.id === item.id);
    if (existing >= 0) {
      dispatch(setCurrentSong(existing));
    } else {
      dispatch(
        setPlaylist({
          playlist: [
            ...playlist,
            {
              id: item.id,
              title: item.title,
              artist: item.primaryArtists || item.artist || "",
              image: typeof item.image === "string" ? item.image : getImageUrl(item.image as any, "medium"),
            },
          ],
          index: playlist.length,
        })
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 10 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          Results for "{decodeURIComponent(query || "")}"
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {/* Top Results / Songs */}
          {data?.songs?.results && data.songs.results.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Songs" />
              {data.songs.results.slice(0, 6).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleSongPress(item)}
                  style={[styles.row, { borderBottomColor: colors.border }]}
                >
                  <Image
                    source={{
                      uri: typeof item.image === "string" ? item.image : getImageUrl(item.image as any, "low"),
                    }}
                    style={styles.rowImg}
                  />
                  <View style={styles.rowInfo}>
                    <Text
                      style={[styles.rowTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {decodeHtml(item.title)}
                    </Text>
                    <Text
                      style={[styles.rowSub, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {item.primaryArtists || item.description || ""}
                    </Text>
                  </View>
                  <Ionicons
                    name="play-circle-outline"
                    size={28}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Albums */}
          {data?.albums?.results && data.albums.results.length > 0 && (
            <HorizontalList
              title="Albums"
              data={data.albums.results}
              keyExtractor={(item) => `sa-${item.id}`}
              renderItem={(item) => (
                <AlbumCard
                  item={{
                    id: item.id,
                    name: item.title,
                    image: item.image as any,
                    primaryArtists: item.artist,
                  }}
                  type="album"
                />
              )}
            />
          )}

          {/* Artists */}
          {data?.artists?.results && data.artists.results.length > 0 && (
            <HorizontalList
              title="Artists"
              data={data.artists.results}
              keyExtractor={(item) => `sr-${item.id}`}
              renderItem={(item) => (
                <AlbumCard
                  item={{
                    id: item.id,
                    name: item.title,
                    image: item.image as any,
                  }}
                  type="artist"
                />
              )}
            />
          )}

          {/* Playlists */}
          {data?.playlists?.results && data.playlists.results.length > 0 && (
            <HorizontalList
              title="Playlists"
              data={data.playlists.results}
              keyExtractor={(item) => `sp-${item.id}`}
              renderItem={(item) => (
                <AlbumCard
                  item={{
                    id: item.id,
                    name: item.title,
                    image: item.image as any,
                  }}
                  type="playlist"
                />
              )}
            />
          )}
        </ScrollView>
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
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginLeft: Spacing.md,
    marginRight: Spacing.md,
    textAlign: "center",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowImg: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
  },
  rowInfo: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  rowTitle: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  rowSub: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
