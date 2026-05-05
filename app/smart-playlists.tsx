import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Spacing, FontSize } from "@/theme";
import { fetchSmartPlaylists, type SmartPlaylistItem } from "@/api";

export default function SmartPlaylistsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: Spacing.md, paddingTop: insets.top + Spacing.md }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Smart Playlists</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading && (
        <Text style={{ color: colors.textSecondary, marginTop: Spacing.lg }}>Loading…</Text>
      )}
      {!loading && items.length === 0 && (
        <Text style={{ color: colors.textSecondary, marginTop: Spacing.lg }}>
          Listen to more songs and we'll generate themed playlists for you.
        </Text>
      )}

      {items.map((p, idx) => (
        <View
          key={`${p.theme ?? p.name}-${idx}`}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.theme, { color: colors.primary }]}>
            {(p.theme ?? "").toUpperCase()}
          </Text>
          <Text style={[styles.name, { color: colors.text }]}>{p.name}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm }}>
            {p.description}
          </Text>
          <Text
            style={{ color: colors.textSecondary, fontSize: FontSize.xs, marginTop: 4 }}
          >
            {p.songIds?.length ?? 0} songs
          </Text>
        </View>
      ))}
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
  card: {
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  theme: { fontSize: FontSize.xs, fontWeight: "700", letterSpacing: 1 },
  name: { fontSize: FontSize.lg, fontWeight: "600", marginTop: 4, marginBottom: 6 },
});
