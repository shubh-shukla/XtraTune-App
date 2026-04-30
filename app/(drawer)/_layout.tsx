import React from "react";
import { View, StyleSheet } from "react-native";
import { Drawer } from "expo-router/drawer";
import { useTheme } from "@/theme";
import DrawerContent from "@/navigation/DrawerContent";
import MiniPlayer, { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";
import { useAppSelector } from "@/store/hooks";

export default function DrawerLayout() {
  const { colors } = useTheme();
  const hasPlaylist = useAppSelector((s) => s.player.playlist.length > 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Drawer
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: colors.background,
            width: 280,
          },
          drawerType: "front",
          swipeEdgeWidth: 50,
        }}
      >
        <Drawer.Screen name="(tabs)" options={{ title: "Home" }} />
        <Drawer.Screen name="playlists" options={{ title: "My Playlists" }} />
        <Drawer.Screen name="settings" options={{ title: "Settings" }} />
      </Drawer>

      {/* MiniPlayer overlays ALL drawer screens (tabs + detail pages) */}
      {hasPlaylist && (
        <View style={styles.miniPlayerContainer}>
          <MiniPlayer />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  miniPlayerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: MINI_PLAYER_HEIGHT,
    zIndex: 100,
  },
});
