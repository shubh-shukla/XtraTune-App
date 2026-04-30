import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { fetchStations } from "@/api";
import { getImageUrl, decodeHtml } from "@/utils";
import EmptyState from "@/components/common/EmptyState";
import type { StationSection, StationItem } from "@/types";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = (SCREEN_W - Spacing.lg * 2 - Spacing.md) / 2;

export default function RadioTab() {
  const { colors } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [sections, setSections] = useState<StationSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStations()
      .then(setSections)
      .finally(() => setLoading(false));
  }, []);

  const renderStation = (station: StationItem) => {
    const imageUrl = getImageUrl(station.image);
    return (
      <TouchableOpacity
        key={station.id}
        onPress={() => router.push(`/playlist/${station.id}` as any)}
        activeOpacity={0.7}
        style={[styles.stationCard, { backgroundColor: colors.card }]}
      >
        <Image source={{ uri: imageUrl }} style={styles.stationImage} />
        <Text
          style={[styles.stationName, { color: colors.text }]}
          numberOfLines={2}
        >
          {decodeHtml(station.name)}
        </Text>
        {station.songCount && (
          <Text
            style={[styles.stationCount, { color: colors.textSecondary }]}
          >
            {station.songCount} songs
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            hitSlop={12}
          >
            <Ionicons name="menu" size={26} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.primary }]}>Radio</Text>
          <View style={{ width: 26 }} />
        </View>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
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
        <Text style={[styles.title, { color: colors.primary }]}>Radio</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {sections.length === 0 ? (
          <EmptyState
            icon="radio-outline"
            title="No stations available"
            message="Check back later for curated radio stations"
          />
        ) : (
          sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {section.emoji} {section.title}
              </Text>
              <View style={styles.stationsGrid}>
                {section.stations.map(renderStation)}
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  stationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    justifyContent: "space-between",
  },
  stationCard: {
    width: CARD_W,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  stationImage: {
    width: "100%",
    aspectRatio: 1,
  },
  stationName: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  stationCount: {
    fontSize: FontSize.xs,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
    marginTop: 2,
  },
});
