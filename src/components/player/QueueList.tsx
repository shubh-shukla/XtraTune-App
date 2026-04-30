import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setCurrentSong, removeAt } from "@/store/player-slice";
import { formatDuration, truncate } from "@/utils";

export default function QueueList() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { playlist, currentSong } = useAppSelector((s) => s.player);

  const renderItem = ({
    item,
    index,
  }: {
    item: (typeof playlist)[0];
    index: number;
  }) => {
    const isActive = index === currentSong;
    return (
      <TouchableOpacity
        onPress={() => dispatch(setCurrentSong(index))}
        activeOpacity={0.7}
        style={[
          styles.row,
          {
            backgroundColor: isActive ? colors.surface : "transparent",
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Image
          source={{
            uri: item.image || "https://via.placeholder.com/48",
          }}
          style={styles.art}
        />
        <View style={styles.info}>
          <Text
            style={[
              styles.title,
              { color: isActive ? colors.primary : colors.text },
            ]}
            numberOfLines={1}
          >
            {item.title ?? "Unknown"}
          </Text>
          <Text
            style={[styles.artist, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.artist ?? ""}
          </Text>
        </View>
        <Text style={[styles.duration, { color: colors.textMuted }]}>
          {formatDuration(item.duration)}
        </Text>
        <TouchableOpacity
          onPress={() => dispatch(removeAt(index))}
          hitSlop={8}
          style={styles.removeBtn}
        >
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Queue
        </Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {playlist.length} songs
        </Text>
      </View>

      <FlatList
        data={playlist}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: "700",
    marginLeft: Spacing.md,
  },
  count: {
    fontSize: FontSize.sm,
  },
  list: {
    paddingBottom: 100,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  art: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  info: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  artist: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  duration: {
    fontSize: FontSize.xs,
    marginRight: Spacing.sm,
  },
  removeBtn: {
    padding: Spacing.xs,
  },
});
