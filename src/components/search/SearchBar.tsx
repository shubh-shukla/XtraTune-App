import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { fetchSearchSuggestions, fetchTrendingSearch } from "@/api";
import { getImageUrl, decodeHtml } from "@/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPlaylist, setCurrentSong } from "@/store/player-slice";
import type { SearchResult, SearchSuggestions } from "@/types";

const RECENT_SEARCHES_KEY = "xt_recent_searches";
const MAX_RECENT = 8;

export default function SearchBar() {
  const { colors } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentPlaylist = useAppSelector((s) => s.player.playlist);
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchSuggestions | null>(null);
  const [trending, setTrending] = useState<any[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  // Load recent searches & trending
  useEffect(() => {
    AsyncStorage.getItem(RECENT_SEARCHES_KEY).then((val) => {
      if (val) setRecents(JSON.parse(val));
    });
    fetchTrendingSearch().then(setTrending);
  }, []);

  const saveRecent = async (term: string) => {
    const updated = [term, ...recents.filter((r) => r !== term)].slice(
      0,
      MAX_RECENT
    );
    setRecents(updated);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (text.length < 2) {
        setResults(null);
        return;
      }

      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const data = await fetchSearchSuggestions(text);
          setResults(data);
        } finally {
          setLoading(false);
        }
      }, 350);
    },
    []
  );

  const handleSubmit = () => {
    if (!query.trim()) return;
    saveRecent(query.trim());
    Keyboard.dismiss();
    router.push(`/search/${encodeURIComponent(query.trim())}`);
  };

  const handleResultPress = (item: SearchResult) => {
    Keyboard.dismiss();
    saveRecent(item.title);
    const type = item.type;
    if (type === "song") {
      // Play the song immediately
      const existing = currentPlaylist.findIndex((p) => p.id === item.id);
      if (existing >= 0) {
        dispatch(setCurrentSong(existing));
      } else {
        dispatch(
          setPlaylist({
            playlist: [
              ...currentPlaylist,
              {
                id: item.id,
                title: item.title,
                artist: item.primaryArtists || item.artist || item.description || "",
                image:
                  typeof item.image === "string"
                    ? item.image
                    : getImageUrl(item.image as any, "medium"),
              },
            ],
            index: currentPlaylist.length,
          })
        );
      }
    } else if (type === "artist") {
      router.push(`/artist/${item.id}`);
    } else if (type === "album") {
      router.push(`/album/${item.id}`);
    } else if (type === "playlist") {
      router.push(`/playlist/${item.id}`);
    } else {
      // Fallback: show search results
      router.push(`/search/${encodeURIComponent(item.title)}`);
    }
  };

  // Flatten all results
  const allResults: SearchResult[] = results
    ? [
        ...(results.topResult ?? []),
        ...(results.songs ?? []),
        ...(results.albums ?? []),
        ...(results.artists ?? []),
        ...(results.playlists ?? []),
      ].slice(0, 15)
    : [];

  return (
    <View style={styles.wrapper}>
      {/* Search input */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBackground,
            borderColor: focused ? colors.primary : colors.border,
          },
        ]}
      >
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          placeholder="Search songs, albums, artists..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={handleSearch}
          onSubmitEditing={handleSubmit}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery("");
              setResults(null);
            }}
          >
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Loading */}
      {loading && (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: Spacing.md }}
        />
      )}

      {/* Results */}
      {allResults.length > 0 && (
        <FlatList
          data={allResults}
          keyExtractor={(item) => item.id + (item.type ?? "")}
          keyboardShouldPersistTaps="handled"
          style={styles.resultsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleResultPress(item)}
              style={[styles.resultRow, { borderBottomColor: colors.border }]}
            >
              <Image
                source={{
                  uri:
                    (typeof item.image === "string"
                      ? item.image
                      : getImageUrl(item.image as any, "low")) ||
                    "https://via.placeholder.com/40",
                }}
                style={[
                  styles.resultImg,
                  item.type === "artist" && styles.artistImg,
                ]}
              />
              <View style={styles.resultInfo}>
                <Text
                  style={[styles.resultTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {decodeHtml(item.title)}
                </Text>
                <Text
                  style={[
                    styles.resultSub,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {item.type?.toUpperCase()} •{" "}
                  {item.description || item.artist || item.primaryArtists || ""}
                </Text>
              </View>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Empty state: recent + trending */}
      {!results && !loading && query.length === 0 && (
        <View style={styles.emptyContainer}>
          {recents.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Recent Searches
              </Text>
              {recents.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => {
                    setQuery(r);
                    handleSearch(r);
                  }}
                  style={styles.recentRow}
                >
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={colors.textMuted}
                  />
                  <Text
                    style={[styles.recentText, { color: colors.text }]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {trending.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Trending
              </Text>
              {trending.slice(0, 6).map((item: any, i: number) => (
                <TouchableOpacity
                  key={item.id || i}
                  onPress={() =>
                    handleResultPress({
                      id: item.id,
                      title: item.name || item.title,
                      type: item.type,
                      image: item.image,
                    })
                  }
                  style={styles.recentRow}
                >
                  <Ionicons
                    name="trending-up"
                    size={16}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.recentText, { color: colors.text }]}
                  >
                    {decodeHtml(item.name || item.title)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    marginLeft: Spacing.sm,
    marginRight: Spacing.sm,
  },
  resultsList: {
    marginTop: Spacing.sm,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultImg: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
  },
  artistImg: {
    borderRadius: 22,
  },
  resultInfo: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  resultTitle: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  resultSub: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  emptyContainer: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  recentText: {
    fontSize: FontSize.md,
    marginLeft: Spacing.md,
  },
});
