import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme, Spacing, FontSize } from "@/theme";
import { fetchSmartPlaylists, type SmartPlaylistItem } from "@/api";

export default function SmartPlaylistsSection() {
  const { colors } = useTheme();
  const router = useRouter();
  const [items, setItems] = useState<SmartPlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchSmartPlaylists().then((res) => {
      if (alive) {
        setItems(res);
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
        <Text style={[styles.title, { color: colors.text }]}>Smart Playlists</Text>
        <TouchableOpacity onPress={() => router.push("/smart-playlists")}>
          <Text style={{ color: colors.primary }}>See all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(p, idx) => `${p.theme ?? p.name}-${idx}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.md }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.theme, { color: colors.primary }]}>
              {(item.theme ?? "").toUpperCase()}
            </Text>
            <Text numberOfLines={2} style={[styles.name, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text
              numberOfLines={2}
              style={{ color: colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 }}
            >
              {item.description}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs, marginTop: 4 }}>
              {item.songIds?.length ?? 0} songs
            </Text>
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
  card: {
    width: 220,
    padding: Spacing.md,
    marginRight: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  theme: { fontSize: FontSize.xs, fontWeight: "700", letterSpacing: 1 },
  name: { fontSize: FontSize.lg, fontWeight: "600", marginTop: 4 },
});
