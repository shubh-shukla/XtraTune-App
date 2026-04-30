import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useTheme, Spacing, FontSize } from "@/theme";

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>
            See All
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface HorizontalListProps<T> {
  title: string;
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T) => string;
  onSeeAll?: () => void;
}

export function HorizontalList<T>({
  title,
  data,
  renderItem,
  keyExtractor,
  onSeeAll,
}: HorizontalListProps<T>) {
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title={title} onSeeAll={onSeeAll} />
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={keyExtractor}
        renderItem={({ item, index }) => renderItem(item, index)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  seeAll: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
});
