import React from "react";
import { View, StyleSheet } from "react-native";
import QueueList from "@/components/player/QueueList";
import { useTheme } from "@/theme";

export default function QueueModal() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <QueueList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
