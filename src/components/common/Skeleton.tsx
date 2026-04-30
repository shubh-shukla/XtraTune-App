import React from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { useTheme, BorderRadius, Spacing } from "@/theme";

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({
  width,
  height,
  borderRadius = BorderRadius.md,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SongCardSkeleton() {
  return (
    <View style={{ marginRight: Spacing.md, width: 145 }}>
      <Skeleton width={145} height={145} borderRadius={BorderRadius.lg} />
      <Skeleton
        width={110}
        height={12}
        style={{ marginTop: Spacing.sm }}
      />
      <Skeleton width={80} height={10} style={{ marginTop: 4 }} />
    </View>
  );
}

export function SongRowSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton width={48} height={48} borderRadius={BorderRadius.md} />
      <View style={{ marginLeft: Spacing.md, flex: 1 }}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="50%" height={12} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

export function HomeScreenSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map((section) => (
        <View key={section} style={{ marginBottom: Spacing.xl }}>
          <Skeleton
            width={150}
            height={20}
            style={{ marginBottom: Spacing.md, marginLeft: Spacing.lg }}
          />
          <View style={styles.horizontalRow}>
            {[1, 2, 3].map((i) => (
              <SongCardSkeleton key={i} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  horizontalRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
  },
});
