import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { getImageUrl, decodeHtml, truncate } from "@/utils";
import type { Album, JioPlaylist, Chart } from "@/types";

interface AlbumCardProps {
  item: Album | JioPlaylist | Chart;
  type?: "album" | "playlist" | "chart" | "artist";
  width?: number;
  onPress?: () => void;
}

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W * 0.38;

export default function AlbumCard({ item, type, width, onPress }: AlbumCardProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const imageUrl = getImageUrl(item.image);
  const title = decodeHtml(
    "name" in item ? item.name : "title" in item ? item.title : ""
  );
  const subtitle = decodeHtml(
    "primaryArtists" in item && item.primaryArtists
      ? String(item.primaryArtists)
      : "subtitle" in item && item.subtitle
      ? item.subtitle
      : "firstname" in item && item.firstname
      ? item.firstname
      : ""
  );

  const resolvedType =
    type ?? ("type" in item ? item.type : undefined) ?? "playlist";

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (resolvedType === "artist") {
      router.push(`/artist/${item.id}`);
    } else if (resolvedType === "album") {
      router.push(`/album/${item.id}`);
    } else {
      router.push(`/playlist/${item.id}`);
    }
  };

  const cardWidth = width ?? CARD_W;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.card,
        { width: cardWidth },
        // Only add right margin in horizontal lists; grids pass explicit width
        !width && { marginRight: Spacing.md },
        !!width && { marginBottom: Spacing.md },
      ]}
    >
      <View
        style={[
          styles.imageWrapper,
          resolvedType === "artist" && styles.artistImageWrapper,
          { backgroundColor: colors.card },
        ]}
      >
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.playOverlay}>
          <Ionicons name="play" size={22} color="#fff" />
        </View>
      </View>
      <Text
        style={[styles.title, { color: colors.text }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {!!subtitle && (
        <Text
          style={[styles.subtitle, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {truncate(subtitle, 28)}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    // marginRight applied dynamically based on usage context
  },
  imageWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    aspectRatio: 1,
    marginBottom: Spacing.sm,
  },
  artistImageWrapper: {
    borderRadius: 999,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
