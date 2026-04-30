import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setAudioQuality,
  setTheme,
  setCrossfade,
  setShowLyricsAuto,
  setSleepTimer,
} from "@/store/settings-slice";
import { toggleAutoplay } from "@/store/player-slice";
import { useAuth } from "@/hooks";

type QualityOption = "low" | "medium" | "high" | "extreme";
type ThemeOption = "system" | "light" | "dark";

const QUALITY_OPTIONS: { label: string; value: QualityOption; desc: string }[] =
  [
    { label: "Low", value: "low", desc: "48 kbps" },
    { label: "Medium", value: "medium", desc: "96 kbps" },
    { label: "High", value: "high", desc: "160 kbps" },
    { label: "Extreme", value: "extreme", desc: "320 kbps" },
  ];

const THEME_OPTIONS: { label: string; value: ThemeOption; icon: string }[] = [
  { label: "System", value: "system", icon: "phone-portrait-outline" },
  { label: "Light", value: "light", icon: "sunny-outline" },
  { label: "Dark", value: "dark", icon: "moon-outline" },
];

const SLEEP_OPTIONS: { label: string; value: number }[] = [
  { label: "Off", value: 0 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();

  const settings = useAppSelector((s) => s.settings);
  const autoplay = useAppSelector((s) => s.player.autoplay);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          signOut();
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 10 }]}
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Settings
        </Text>
      </View>

      {/* Account */}
      <SectionHeader title="Account" colors={colors} />
      {isAuthenticated && user ? (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.accountRow}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.primary + "22" },
              ]}
            >
              <Ionicons name="person" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.accountName, { color: colors.text }]}>
                {user.name || "User"}
              </Text>
              <Text
                style={[
                  styles.accountEmail,
                  { color: colors.textSecondary },
                ]}
              >
                {user.email || ""}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleSignOut}
            style={[styles.signOutBtn, { borderColor: "#ef4444" }]}
          >
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            <Text style={{ color: "#ef4444", fontWeight: "600" }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => router.push("/auth")}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <View style={styles.settingRow}>
            <Ionicons name="log-in-outline" size={22} color={colors.primary} />
            <Text style={[styles.settingLabel, { color: colors.primary }]}>
              Sign In
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      )}

      {/* Theme */}
      <SectionHeader title="Appearance" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.optionGroup}>
          {THEME_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => dispatch(setTheme(opt.value))}
              style={[
                styles.chipBtn,
                {
                  borderColor:
                    settings.theme === opt.value
                      ? colors.primary
                      : colors.border,
                  backgroundColor:
                    settings.theme === opt.value
                      ? colors.primary + "18"
                      : "transparent",
                },
              ]}
            >
              <Ionicons
                name={opt.icon as any}
                size={16}
                color={
                  settings.theme === opt.value
                    ? colors.primary
                    : colors.textSecondary
                }
              />
              <Text
                style={{
                  color:
                    settings.theme === opt.value
                      ? colors.primary
                      : colors.text,
                  fontWeight: settings.theme === opt.value ? "600" : "400",
                  fontSize: FontSize.sm,
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Audio Quality */}
      <SectionHeader title="Audio Quality" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {QUALITY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => dispatch(setAudioQuality(opt.value))}
            style={[
              styles.qualityRow,
              { borderBottomColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {opt.label}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: FontSize.xs,
                }}
              >
                {opt.desc}
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                {
                  borderColor:
                    settings.audioQuality === opt.value
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              {settings.audioQuality === opt.value && (
                <View
                  style={[
                    styles.radioInner,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Playback */}
      <SectionHeader title="Playback" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Autoplay
            </Text>
            <Text
              style={{ color: colors.textSecondary, fontSize: FontSize.xs }}
            >
              Automatically play similar songs
            </Text>
          </View>
          <Switch
            value={autoplay}
            onValueChange={() => dispatch(toggleAutoplay())}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Show Lyrics Automatically
            </Text>
            <Text
              style={{ color: colors.textSecondary, fontSize: FontSize.xs }}
            >
              Display lyrics when available
            </Text>
          </View>
          <Switch
            value={settings.showLyricsAuto}
            onValueChange={(v) => dispatch(setShowLyricsAuto(v))}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Crossfade
            </Text>
            <Text
              style={{ color: colors.textSecondary, fontSize: FontSize.xs }}
            >
              Smooth transition between songs
            </Text>
          </View>
          <Switch
            value={settings.crossfade > 0}
            onValueChange={(v) => dispatch(setCrossfade(v ? 3 : 0))}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Sleep Timer */}
      <SectionHeader title="Sleep Timer" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.optionGroup}>
          {SLEEP_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => dispatch(setSleepTimer(opt.value))}
              style={[
                styles.chipBtn,
                {
                  borderColor:
                    settings.sleepTimer === opt.value
                      ? colors.primary
                      : colors.border,
                  backgroundColor:
                    settings.sleepTimer === opt.value
                      ? colors.primary + "18"
                      : "transparent",
                },
              ]}
            >
              <Text
                style={{
                  color:
                    settings.sleepTimer === opt.value
                      ? colors.primary
                      : colors.text,
                  fontWeight:
                    settings.sleepTimer === opt.value ? "600" : "400",
                  fontSize: FontSize.sm,
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* About */}
      <SectionHeader title="About" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.aboutRow}>
          <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm }}>
            Version
          </Text>
          <Text style={{ color: colors.text, fontSize: FontSize.sm }}>
            1.0.0
          </Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm }}>
            Build
          </Text>
          <Text style={{ color: colors.text, fontSize: FontSize.sm }}>
            Expo SDK 52
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function SectionHeader({
  title,
  colors,
}: {
  title: string;
  colors: any;
}) {
  return (
    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    marginLeft: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  card: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  accountName: { fontSize: FontSize.base, fontWeight: "600" },
  accountEmail: { fontSize: FontSize.sm, marginTop: 2 },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
  },
  settingLabel: { fontSize: FontSize.base, fontWeight: "500" },
  optionGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  chipBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 6,
  },
  qualityRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
});
