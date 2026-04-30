import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { fetchSongById } from "@/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPlaylist, setCurrentSong } from "@/store/player-slice";
import { decodeHtml, getImageUrl, songToQueueItem, formatDuration } from "@/utils";
import EmptyState from "@/components/common/EmptyState";
import type { Song } from "@/types";

export default function FavouritesTab() {
  const { colors } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { ids, toggle, loading: favLoading } = useFavorites("track");
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const playlist = useAppSelector((s) => s.player.playlist);

  // Fetch song details for all fav IDs
  useEffect(() => {
    if (ids.length === 0) {
      setSongs([]);
      return;
    }
    setLoading(true);
    Promise.all(ids.map(fetchSongById)).then((results) => {
      setSongs(results.filter(Boolean) as Song[]);
      setLoading(false);
    });
  }, [ids]);

  const handlePlay = (song: Song, index: number) => {
    dispatch(
      setPlaylist({
        playlist: songs.map(songToQueueItem),
        index,
      })
    );
  };

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    dispatch(
      setPlaylist({
        playlist: songs.map(songToQueueItem),
        index: 0,
      })
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            hitSlop={12}
          >
            <Ionicons name="menu" size={26} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.primary }]}>Favourites</Text>
          <View style={{ width: 26 }} />
        </View>
        <EmptyState
          icon="heart-outline"
          title="Sign in to see your favourites"
          message="Like songs and they'll show up here"
          actionLabel="Sign In"
          onAction={() => router.push("/auth")}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          hitSlop={12}
        >
          <Ionicons name="menu" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primary }]}>Favourites</Text>
        {songs.length > 0 && (
          <TouchableOpacity
            onPress={handlePlayAll}
            style={[styles.playAllBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="play" size={16} color="#fff" />
            <Text style={styles.playAllText}>Play All</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading || favLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : songs.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="No favourites yet"
          message="Start liking songs to build your collection"
        />
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item, index) => `fv-${item.id}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
          renderItem={({ item, index }) => {
            const imageUrl = getImageUrl(item.image, "low");
            const artist =
              typeof item.primaryArtists === "string"
                ? item.primaryArtists
                : "";
            return (
              <TouchableOpacity
                onPress={() => handlePlay(item, index)}
                activeOpacity={0.7}
                style={[
                  styles.row,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Image source={{ uri: imageUrl }} style={styles.art} />
                <View style={styles.info}>
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
                    {decodeHtml(artist)}
                  </Text>
                </View>
                <Text style={[styles.duration, { color: colors.textMuted }]}>
                  {formatDuration(item.duration)}
                </Text>
                <TouchableOpacity
                  onPress={() => toggle(item.id)}
                  hitSlop={8}
                >
                  <Ionicons name="heart" size={20} color={colors.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
  },
  playAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  playAllText: {
    color: "#fff",
    fontSize: FontSize.sm,
    fontWeight: "600",
    marginLeft: Spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  art: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
  },
  info: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  songTitle: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  songArtist: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  duration: {
    fontSize: FontSize.xs,
    marginRight: Spacing.sm,
  },
});
