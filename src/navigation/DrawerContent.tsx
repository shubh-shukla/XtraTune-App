import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { label: "Home", icon: "home" as const, route: "/" },
  { label: "Categories", icon: "grid" as const, route: "/categories" },
  { label: "Favourites", icon: "heart" as const, route: "/favourites" },
  { label: "Radio", icon: "radio" as const, route: "/radio" },
  { label: "My Playlists", icon: "musical-notes" as const, route: "/playlists" },
  { label: "Settings", icon: "settings" as const, route: "/settings" },
];

const QUICK_PICKS = [
  { label: "Bollywood", query: "bollywood hits" },
  { label: "Pop", query: "pop hits" },
  { label: "Lo-Fi", query: "lofi beats" },
  { label: "Workout", query: "workout motivation" },
  { label: "Romantic", query: "romantic songs hindi" },
];

export default function DrawerContent() {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scroll}
      bounces={false}
      overScrollMode="never"
      showsVerticalScrollIndicator={false}
    >
      {/* Logo */}
      <View style={[styles.logoSection, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.logoRow}>
          <Ionicons name="musical-notes" size={28} color={colors.primary} />
          <Text style={[styles.logoText, { color: colors.primary }]}>
            XtraTune
          </Text>
        </View>
        {user && (
          <View style={styles.userRow}>
            {user.image ? (
              <Image source={{ uri: user.image }} style={styles.avatar} />
            ) : (
              <View
                style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.avatarLetter}>
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </Text>
              </View>
            )}
            <Text
              style={[styles.userName, { color: colors.text }]}
              numberOfLines={1}
            >
              {user.name}
            </Text>
          </View>
        )}
      </View>

      {/* Navigation */}
      <View style={styles.navSection}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(item.route + "/");
          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => router.push(item.route as any)}
              style={[
                styles.navItem,
                isActive && {
                  backgroundColor: colors.primary + "20",
                  borderLeftColor: colors.primary,
                  borderLeftWidth: 3,
                },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={22}
                color={isActive ? colors.primary : colors.icon}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: isActive ? colors.primary : colors.text },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Picks */}
      <View style={styles.quickSection}>
        <Text style={[styles.quickTitle, { color: colors.textSecondary }]}>
          QUICK PICKS
        </Text>
        {QUICK_PICKS.map((pick) => (
          <TouchableOpacity
            key={pick.query}
            onPress={() =>
              router.push(
                `/search/${encodeURIComponent(pick.query)}` as any
              )
            }
            style={styles.quickItem}
          >
            <Ionicons name="flash" size={16} color={colors.primary} />
            <Text style={[styles.quickLabel, { color: colors.text }]}>
              {pick.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 40,
  },
  logoSection: {
    paddingTop: 60, // overridden by inline style with insets.top
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(128,128,128,0.2)",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    marginLeft: Spacing.sm,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    color: "#fff",
    fontSize: FontSize.base,
    fontWeight: "700",
  },
  userName: {
    fontSize: FontSize.md,
    fontWeight: "600",
    marginLeft: Spacing.md,
  },
  navSection: {
    paddingVertical: Spacing.lg,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  navLabel: {
    fontSize: FontSize.base,
    fontWeight: "500",
    marginLeft: Spacing.lg,
  },
  quickSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128,128,128,0.2)",
  },
  quickTitle: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
  },
  quickItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  quickLabel: {
    fontSize: FontSize.sm,
    marginLeft: Spacing.md,
  },
});
