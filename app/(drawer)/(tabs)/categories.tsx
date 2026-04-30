import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = (SCREEN_W - Spacing.lg * 2 - Spacing.md) / 2;

const CATEGORIES = [
  { name: "Romantic",   icon: "heart"        as const, query: "romantic songs hindi",  gradient: ["#ec4899", "#be185d"] as const },
  { name: "Workout",    icon: "fitness"      as const, query: "workout motivation",    gradient: ["#f97316", "#dc2626"] as const },
  { name: "Focus",      icon: "bulb"         as const, query: "focus study music",     gradient: ["#3b82f6", "#6366f1"] as const },
  { name: "Party",      icon: "sparkles"     as const, query: "party dance hits",      gradient: ["#fbbf24", "#f97316"] as const },
  { name: "Indie",      icon: "musical-note" as const, query: "indie music hindi",     gradient: ["#22c55e", "#059669"] as const },
  { name: "Retro",      icon: "disc"         as const, query: "retro bollywood",       gradient: ["#a855f7", "#7c3aed"] as const },
  { name: "Chill",      icon: "cafe"         as const, query: "chill vibes hindi",     gradient: ["#06b6d4", "#2563eb"] as const },
  { name: "Devotional", icon: "leaf"         as const, query: "devotional bhajans",    gradient: ["#f59e0b", "#b45309"] as const },
  { name: "Pop",        icon: "star"         as const, query: "pop hits hindi",        gradient: ["#e879f9", "#c026d3"] as const },
  { name: "Lo-Fi",      icon: "headset"      as const, query: "lofi beats",            gradient: ["#818cf8", "#4f46e5"] as const },
];

export default function CategoriesTab() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          hitSlop={12}
        >
          <Ionicons name="menu" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primary }]}>
          Browse
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            activeOpacity={0.85}
            onPress={() =>
              router.push(
                `/category/${encodeURIComponent(cat.query)}?name=${encodeURIComponent(cat.name)}` as any
              )
            }
            style={styles.card}
          >
            <LinearGradient
              colors={cat.gradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.iconBubble}>
                <Ionicons name={cat.icon} size={24} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>{cat.name}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <View style={{ height: 120 }} />
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    width: CARD_W,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // Android shadow
    elevation: 4,
  },
  cardGradient: {
    height: 110,
    borderRadius: BorderRadius.xl,
    justifyContent: "flex-end",
    padding: Spacing.md,
  },
  iconBubble: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    color: "#fff",
    fontSize: FontSize.base,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
