import React from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, FontSize } from "@/theme";
import { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";
import { useAppSelector } from "@/store/hooks";

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const hasPlaylist = useAppSelector((s) => s.player.playlist.length > 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBarBorder,
            height: 56 + insets.bottom,
            paddingBottom: insets.bottom || 6,
            // Push tab bar above mini player when playing
            ...(hasPlaylist && { marginBottom: MINI_PLAYER_HEIGHT }),
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: FontSize.xs,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: "Browse",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favourites"
          options={{
            title: "Likes",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="radio"
          options={{
            title: "Radio",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="radio" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
