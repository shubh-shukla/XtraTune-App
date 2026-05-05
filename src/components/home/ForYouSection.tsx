import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme, Spacing, FontSize } from "@/theme";
import { fetchRecommendations, type RecommendedItem } from "@/api";
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

export default function ForYouSection() {
  const { colors } = useTheme();
  const router = useRouter();
  const [items, setItems] = useState<RecommendedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchRecommendations().then((res) => {
      if (alive) {
        setItems(res.items);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>For You</Text>
        <TouchableOpacity onPress={() => router.push("/recommendations")}>
          <Text style={{ color: colors.primary }}>See all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={items.slice(0, 12)}
        keyExtractor={(it, idx) => (it.songId ?? it.id ?? `r-${idx}`) as string}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.md }}
        renderItem={({ item }) => (
          <View style={{ width: 160, marginRight: Spacing.sm }}>
            <SongCard song={toSong(item)} />
            {item.reason ? (
              <Text
                numberOfLines={2}
                style={{ color: colors.textSecondary, fontSize: FontSize.xs, marginTop: 4 }}
              >
                {item.reason}
              </Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: Spacing.lg, marginBottom: Spacing.lg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  title: { fontSize: FontSize.xl, fontWeight: "700" },
});
