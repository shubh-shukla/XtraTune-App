import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Spacing, FontSize } from "@/theme";
import {
  fetchRecommendations,
  refreshRecommendations,
  type RecommendedItem,
} from "@/api";
import SongCard from "@/components/common/SongCard";
import type { Song } from "@/types";

function toSong(item: RecommendedItem): Song {
  return {
    id: (item.songId ?? item.id ?? "") as string,
    name: (item.title ?? item.name ?? "") as string,
    primaryArtists: (item.primaryArtists ?? item.artist ?? "") as any,
    image: (item.image ?? []) as any,
    language: item.language ?? "",
    downloadUrl: item.downloadUrl ?? [],
  } as unknown as Song;
}

export default function RecommendationsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<RecommendedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await fetchRecommendations();
    setItems(res.items);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRecommendations();
    await load();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: Spacing.md, paddingTop: insets.top + Spacing.md }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Recommendations</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading && (
        <Text style={{ color: colors.textSecondary, marginTop: Spacing.lg }}>Loading…</Text>
      )}
      {!loading && items.length === 0 && (
        <Text style={{ color: colors.textSecondary, marginTop: Spacing.lg }}>
          Listen to a few songs and your AI feed will appear here.
        </Text>
      )}

      <View style={styles.grid}>
        {items.map((item, idx) => (
          <View key={(item.songId ?? item.id ?? `r-${idx}`) as string} style={styles.gridItem}>
            <SongCard song={toSong(item)} />
            {item.reason ? (
              <Text
                numberOfLines={3}
                style={{ color: colors.textSecondary, fontSize: FontSize.xs, marginTop: 4 }}
              >
                {item.reason}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  title: { fontSize: FontSize.xxl, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridItem: { width: "48%", marginBottom: Spacing.md },
});
