import React from "react";
import { View, StyleSheet } from "react-native";
import FullScreenPlayer from "@/components/player/FullScreenPlayer";
import { useTheme } from "@/theme";

export default function PlayerModal() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FullScreenPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
