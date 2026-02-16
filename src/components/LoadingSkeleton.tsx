import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet, Dimensions} from 'react-native';
import {colors, spacing} from '@theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
const SKELETON_ROWS = 3;

function Bone({
  width,
  height,
  style,
  pulseAnim,
}: {
  width: number | `${number}%`;
  height: number;
  style?: object;
  pulseAnim: Animated.Value;
}) {
  return (
    <Animated.View
      style={[
        styles.bone,
        {width, height, opacity: pulseAnim},
        style,
      ]}
    />
  );
}

function SkeletonCard({pulseAnim}: {pulseAnim: Animated.Value}) {
  return (
    <View style={styles.card}>
      <Animated.View style={[styles.image, {opacity: pulseAnim}]} />
      <View style={styles.content}>
        <Bone width="40%" height={8} pulseAnim={pulseAnim} />
        <Bone
          width="90%"
          height={12}
          pulseAnim={pulseAnim}
          style={styles.titleGap}
        />
        <Bone
          width="60%"
          height={12}
          pulseAnim={pulseAnim}
          style={styles.titleGap}
        />
        <Bone
          width="45%"
          height={12}
          pulseAnim={pulseAnim}
          style={styles.priceGap}
        />
      </View>
    </View>
  );
}

export function LoadingSkeleton() {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading products">
      {Array.from({length: SKELETON_ROWS}).map((_, i) => (
        <View key={i} style={styles.row}>
          <SkeletonCard pulseAnim={pulseAnim} />
          <SkeletonCard pulseAnim={pulseAnim} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  card: {
    width: CARD_WIDTH,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.skeleton,
  },
  content: {
    paddingTop: 10,
  },
  bone: {
    backgroundColor: colors.skeleton,
    borderRadius: 4,
  },
  titleGap: {
    marginTop: 6,
  },
  priceGap: {
    marginTop: 8,
  },
});
