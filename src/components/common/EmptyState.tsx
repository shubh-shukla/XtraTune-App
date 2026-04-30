import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
}

export default function EmptyState({
  icon = "musical-notes-outline",
  title,
  message,
  actionLabel,
  onAction,
  loading,
}: EmptyStateProps) {
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.textMuted} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {!!message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
      {!!actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xxl,
    paddingVertical: 60,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  message: {
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  buttonText: {
    color: "#fff",
    fontSize: FontSize.md,
    fontWeight: "600",
  },
});
