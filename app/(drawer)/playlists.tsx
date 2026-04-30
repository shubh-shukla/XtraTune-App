import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { useUserPlaylists, useAuth } from "@/hooks";
import EmptyState from "@/components/common/EmptyState";
import type { UserPlaylist } from "@/types";

export default function PlaylistsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { playlists, loading, refresh, create, remove } = useUserPlaylists();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (isAuthenticated) refresh();
  }, [isAuthenticated]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await create(newName.trim());
    setNewName("");
    setShowCreate(false);
  };

  const handleDelete = (playlist: UserPlaylist) => {
    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete "${playlist.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => remove(playlist.id),
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 10 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text, marginLeft: 12 }]}>Playlists</Text>
          <View style={{ width: 28 }} />
        </View>
        <EmptyState
          icon="person-outline"
          title="Sign in Required"
          message="Sign in to create and manage your playlists"
          actionLabel="Sign In"
          onAction={() => router.push("/auth")}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 10 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text, flex: 1, marginLeft: 12 }]}>
          My Playlists
        </Text>
        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          hitSlop={12}
        >
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Create new */}
      {showCreate && (
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
            placeholder="New playlist name"
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
            <Text style={{ color: "#fff", fontWeight: "600" }}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCreate(false)} hitSlop={12}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
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
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/playlist/[id]",
                  params: { id: item.id, isUser: "true" },
                })
              }
              style={[
                styles.playlistRow,
                { borderBottomColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.playlistIcon,
                  { backgroundColor: colors.primary + "18" },
                ]}
              >
                <Ionicons
                  name="musical-notes"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.playlistName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.playlistMeta,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item.songs?.length || 0} songs
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                hitSlop={12}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="albums-outline"
              title="No playlists yet"
              message="Create your first playlist to get started"
              actionLabel="Create Playlist"
              onAction={() => setShowCreate(true)}
            />
          }
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
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: { fontSize: FontSize.xxl, fontWeight: "700" },
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
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  playlistName: { fontSize: FontSize.base, fontWeight: "600" },
  playlistMeta: { fontSize: FontSize.sm, marginTop: 2 },
});
