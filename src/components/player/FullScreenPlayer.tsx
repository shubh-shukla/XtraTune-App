import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleAutoplay, toggleShuffle, cycleRepeat } from "@/store/player-slice";
import type { RepeatMode } from "@/store/player-slice";
import { toggleSave } from "@/store/likes-slice";
import { useAudioPlayerContext, setIsSeeking } from "@/hooks/AudioPlayerContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useListeningHistory } from "@/hooks/useListeningHistory";
import { formatMillis, decodeHtml } from "@/utils";
import { fetchLyrics } from "@/api";
import type { LyricsData } from "@/types";

const { width: SCREEN_W } = Dimensions.get("window");
const ART_SIZE = SCREEN_W - 80;

export default function FullScreenPlayer() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { togglePlayPause, seekTo, playNext, playPrev } =
    useAudioPlayerContext();
  const { isPlaying, positionMillis, durationMillis, autoplay, shuffle, repeat, playlist, currentSong } =
    useAppSelector((s) => s.player);
  const currentItem = playlist[currentSong];
  const saves = useAppSelector((s) => s.likes.saves);
  const { isLiked, toggle: toggleFav } = useFavorites("track");
  useListeningHistory(Math.floor((positionMillis ?? 0) / 1000));

  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [localSeeking, setLocalSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const liked = currentItem ? isLiked(currentItem.id) : false;
  const saved = currentItem
    ? saves.track.includes(currentItem.id)
    : false;

  // Fetch lyrics
  useEffect(() => {
    if (!currentItem?.id) return;
    setLyricsData(null);
    fetchLyrics(currentItem.id).then(setLyricsData);
  }, [currentItem?.id]);

  if (!currentItem) return null;

  const progress = durationMillis > 0 ? positionMillis / durationMillis : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerLabel, { color: colors.textSecondary }]}>
            NOW PLAYING
          </Text>
          <Text
            style={[styles.headerTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {currentItem.title ?? "Unknown"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/queue")}
          hitSlop={12}
        >
          <Ionicons name="list" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!showLyrics ? (
          <>
            {/* Artwork */}
            <View style={styles.artworkWrapper}>
              <Image
                source={{
                  uri:
                    currentItem.image || "https://via.placeholder.com/400",
                }}
                style={[styles.artwork, { borderColor: colors.border }]}
              />
            </View>

            {/* Song info */}
            <View style={styles.songInfo}>
              <View style={styles.titleRow}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.songTitle, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {decodeHtml(currentItem.title)}
                  </Text>
                  <Text
                    style={[
                      styles.songArtist,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {currentItem.artist ?? ""}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => currentItem && toggleFav(currentItem.id)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={liked ? "heart" : "heart-outline"}
                    size={26}
                    color={liked ? colors.danger : colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          /* Lyrics view */
          <View style={styles.lyricsContainer}>
            <Text style={[styles.lyricsTitle, { color: colors.text }]}>
              Lyrics
            </Text>
            {lyricsData?.lyrics ? (
              <Text style={[styles.lyricsText, { color: colors.textSecondary }]}>
                {lyricsData.lyrics}
              </Text>
            ) : (
              <Text style={[styles.noLyrics, { color: colors.textMuted }]}>
                No lyrics available
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Progress slider */}
      <View style={styles.progressSection}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={localSeeking ? seekValue : progress}
          onSlidingStart={() => {
            setIsSeeking(true);     // module-level flag
            setLocalSeeking(true); // local state
          }}
          onValueChange={(v) => setSeekValue(v)}
          onSlidingComplete={(v) => {
            seekTo(v * durationMillis);
            setIsSeeking(false);
            setLocalSeeking(false);
          }}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        <View style={styles.timeRow}>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatMillis(localSeeking ? seekValue * durationMillis : positionMillis)}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatMillis(durationMillis)}
          </Text>
        </View>
      </View>

      {/* Main controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => dispatch(toggleShuffle())} hitSlop={8}>
          <Ionicons
            name="shuffle"
            size={22}
            color={shuffle ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={playPrev} hitSlop={12}>
          <Ionicons name="play-skip-back" size={32} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlayPause}
          style={[styles.playBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={32}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={playNext} hitSlop={12}>
          <Ionicons name="play-skip-forward" size={32} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => dispatch(cycleRepeat())} hitSlop={8}>
          <Ionicons
            name={repeat === "one" ? "repeat" : "repeat"}
            size={22}
            color={repeat !== "off" ? colors.primary : colors.textMuted}
          />
          {repeat === "one" && (
            <View style={styles.repeatOneBadge}>
              <Text style={[styles.repeatOneText, { color: colors.primary }]}>1</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Secondary controls */}
      <View style={styles.secondaryRow}>
        <TouchableOpacity onPress={() => dispatch(toggleAutoplay())} hitSlop={8}>
          <Ionicons
            name="infinite"
            size={20}
            color={autoplay ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowLyrics(!showLyrics)}
          hitSlop={8}
        >
          <Ionicons
            name="text"
            size={20}
            color={showLyrics ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          onPress={() =>
            currentItem &&
            dispatch(
              toggleSave({ entityType: "track", id: currentItem.id })
            )
          }
          hitSlop={8}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={22}
            color={saved ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/add-to-playlist")}
          hitSlop={8}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity hitSlop={8}>
          <Ionicons
            name="share-outline"
            size={22}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerLabel: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    marginTop: 2,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  artworkWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    marginVertical: Spacing.xl,
  },
  artwork: {
    width: ART_SIZE,
    height: ART_SIZE,
    borderRadius: BorderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  songInfo: {
    width: "100%",
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  songTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
  },
  songArtist: {
    fontSize: FontSize.base,
    marginTop: 4,
  },
  lyricsContainer: {
    width: "100%",
    minHeight: ART_SIZE,
    paddingVertical: Spacing.lg,
  },
  lyricsTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  lyricsText: {
    fontSize: FontSize.base,
    lineHeight: 26,
  },
  noLyrics: {
    fontSize: FontSize.md,
    textAlign: "center",
    marginTop: 40,
  },
  progressSection: {
    paddingHorizontal: Spacing.lg,
  },
  slider: {
    width: "100%",
    height: 30,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -4,
  },
  time: {
    fontSize: FontSize.xs,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.lg,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 120,
    marginTop: -4,
    marginBottom: Spacing.sm,
  },
  repeatOneBadge: {
    position: "absolute",
    bottom: -6,
    right: -4,
  },
  repeatOneText: {
    fontSize: 9,
    fontWeight: "800",
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 80,
    paddingBottom: 20,
  },
});
