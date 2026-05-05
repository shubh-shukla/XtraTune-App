import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Spacing, FontSize } from "@/theme";
import { fetchHomepage } from "@/api";
import SongCard from "@/components/common/SongCard";
import AlbumCard from "@/components/common/AlbumCard";
import { HorizontalList } from "@/components/common/SectionList";
import ForYouSection from "@/components/home/ForYouSection";
import SmartPlaylistsSection from "@/components/home/SmartPlaylistsSection";
import { HomeScreenSkeleton } from "@/components/common/Skeleton";
import { getGreeting } from "@/utils";
import type { HomepageData } from "@/types";

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const result = await fetchHomepage();
    setData(result);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          hitSlop={12}
        >
          <Ionicons name="menu" size={26} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="musical-notes" size={22} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            XtraTune
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(drawer)/(tabs)/search")}
          hitSlop={12}
        >
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <HomeScreenSkeleton />
      ) : !data ? (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={56} color={colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Couldn't load music
          </Text>
          <Text style={[styles.errorMsg, { color: colors.textSecondary }]}>
            Check your connection and try again
          </Text>
          <TouchableOpacity
            onPress={() => { setLoading(true); loadData(); }}
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Greeting */}
          <Text style={[styles.greeting, { color: colors.text }]}>
            {getGreeting()} 🎵
          </Text>

          <ForYouSection />

          {/* Trending Songs */}
          {data?.trending?.songs && data.trending.songs.length > 0 && (
            <HorizontalList
              title="Trending Now"
              data={data.trending.songs}
              keyExtractor={(item) => `ts-${item.id}`}
              renderItem={(item, index) => (
                <SongCard
                  song={item}
                  allSongs={data.trending.songs}
                  index={index}
                />
              )}
            />
          )}

          {/* Trending Albums */}
          {data?.trending?.albums && data.trending.albums.length > 0 && (
            <HorizontalList
              title="Trending Albums"
              data={data.trending.albums}
              keyExtractor={(item) => `ta-${item.id}`}
              renderItem={(item) => <AlbumCard item={item} type="album" />}
            />
          )}

          {/* Top Charts */}
          {data?.charts && data.charts.length > 0 && (
            <HorizontalList
              title="Top Charts"
              data={data.charts}
              keyExtractor={(item) => `ch-${item.id}`}
              renderItem={(item) => <AlbumCard item={item} type="playlist" />}
            />
          )}

          {/* Albums / New Releases */}
          {data?.albums && data.albums.length > 0 && (
            <HorizontalList
              title="New Releases"
              data={data.albums}
              keyExtractor={(item) => `nr-${item.id}`}
              renderItem={(item) => <AlbumCard item={item} type="album" />}
            />
          )}

          {/* Playlists */}
          {data?.playlists && data.playlists.length > 0 && (
            <HorizontalList
              title="Featured Playlists"
              data={data.playlists}
              keyExtractor={(item) => `fp-${item.id}`}
              renderItem={(item) => (
                <AlbumCard item={item} type="playlist" />
              )}
            />
          )}

          <SmartPlaylistsSection />

          <View style={{ height: 120 }} />
        </ScrollView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: "800",
    marginLeft: Spacing.xs,
  },
  scrollContent: {
    paddingTop: Spacing.sm,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginTop: Spacing.md,
  },
  errorMsg: {
    fontSize: FontSize.sm,
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: FontSize.base,
  },
});
