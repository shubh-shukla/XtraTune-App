import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { useUserPlaylists } from "@/hooks";
import { useAppSelector } from "@/store/hooks";
import type { UserPlaylist } from "@/types";

export default function AddToPlaylistModal() {
  const { colors } = useTheme();
  const router = useRouter();
  const { songId } = useLocalSearchParams<{ songId?: string }>();

  const currentIndex = useAppSelector((s) => s.player.currentSong);
  const playerPlaylist = useAppSelector((s) => s.player.playlist);
  const currentItem = playerPlaylist[currentIndex];
  const targetSongId = songId || currentItem?.id;

  const { playlists, loading, refresh, create, addSong } =
    useUserPlaylists();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await create(newName.trim());
    setNewName("");
    setShowCreate(false);
  };

  const handleAdd = async (playlist: UserPlaylist) => {
    if (!targetSongId) return;
    const ok = await addSong(playlist.id, {
      id: targetSongId,
      title: currentItem?.title ?? "",
      artist: currentItem?.artist ?? "",
      image: currentItem?.image ?? "",
      duration: currentItem?.duration ?? 0,
    });
    if (ok) {
      Alert.alert("Added", `Song added to "${playlist.name}"`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      Alert.alert("Error", "Song may already exist in this playlist.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Add to Playlist
        </Text>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Create new */}
      {showCreate ? (
        <View style={styles.createRow}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            placeholder="Playlist name"
            placeholderTextColor={colors.textSecondary}
            value={newName}
            onChangeText={setNewName}
            autoFocus
            onSubmitEditing={handleCreate}
          />
          <TouchableOpacity
            onPress={handleCreate}
            style={[styles.createBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Create</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          style={[styles.newPlaylistBtn, { borderColor: colors.border }]}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text
            style={[
              styles.newPlaylistText,
              { color: colors.primary },
            ]}
          >
            Create New Playlist
          </Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleAdd(item)}
              style={[
                styles.playlistRow,
                { borderBottomColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.playlistIcon,
                  { backgroundColor: colors.card },
                ]}
              >
                <Ionicons
                  name="musical-notes"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.playlistName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.playlistCount,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item.songs?.length || 0} songs
                </Text>
              </View>
              <Ionicons
                name="add"
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons
                name="albums-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.emptyText, { color: colors.textSecondary }]}
              >
                No playlists yet. Create one!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: { fontSize: FontSize.xl, fontWeight: "700" },
  newPlaylistBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  newPlaylistText: { fontSize: FontSize.base, fontWeight: "600" },
  createRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.base,
  },
  createBtn: {
    height: 44,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },
  playlistIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  playlistName: { fontSize: FontSize.base, fontWeight: "600" },
  playlistCount: { fontSize: FontSize.sm, marginTop: 2 },
  emptyBox: { alignItems: "center", marginTop: 60, gap: Spacing.md },
  emptyText: { fontSize: FontSize.base },
});
