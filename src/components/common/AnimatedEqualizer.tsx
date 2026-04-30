import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useTheme } from "@/theme";

interface AnimatedEqualizerProps {
  /** Whether the music is actively playing (true) or paused (false) */
  playing?: boolean;
  /** Number of bars */
  barCount?: number;
  /** Width of each bar */
  barWidth?: number;
  /** Max height of each bar */
  barHeight?: number;
  /** Gap between bars */
  gap?: number;
  /** Override bar color (defaults to theme primary) */
  color?: string;
}

export default function AnimatedEqualizer({
  playing = true,
  barCount = 3,
  barWidth = 3,
  barHeight = 14,
  gap = 2,
  color,
}: AnimatedEqualizerProps) {
  const { colors } = useTheme();
  const barColor = color ?? colors.primary;

  // Create animated values for each bar
  const anims = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    if (playing) {
      // Start looping animations with staggered durations
      const animations = anims.map((anim, i) => {
        const duration = 300 + i * 120; // stagger speeds
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.2,
              duration: duration + 80,
              useNativeDriver: false,
            }),
          ])
        );
      });
      animations.forEach((a) => a.start());
      return () => animations.forEach((a) => a.stop());
    } else {
      // Paused: freeze bars at a low level
      anims.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [playing]);

  const totalWidth = barCount * barWidth + (barCount - 1) * gap;

  return (
    <View
      style={[
        styles.container,
        { width: totalWidth, height: barHeight },
      ]}
    >
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              width: barWidth,
              backgroundColor: barColor,
              marginLeft: i > 0 ? gap : 0,
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [barHeight * 0.2, barHeight],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  bar: {
    borderRadius: 1.5,
  },
});
