/**
 * LoadingSkeleton Component
 *
 * Displays placeholder cards while loading.
 */

import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {colors, spacing, layout} from '@theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_GAP = spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - CARD_GAP) / 2;

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.image} />
      <View style={styles.content}>
        <View style={styles.vendorLine} />
        <View style={styles.titleLine} />
        <View style={styles.titleLineShort} />
        <View style={styles.priceLine} />
      </View>
    </View>
  );
}

export function LoadingSkeleton() {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading products">
      <View style={styles.row}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
      <View style={styles.row}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: layout.cardImageHeight,
    backgroundColor: colors.skeleton,
  },
  content: {
    padding: spacing.sm,
  },
  vendorLine: {
    width: '40%',
    height: 10,
    backgroundColor: colors.skeleton,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  titleLine: {
    width: '100%',
    height: 14,
    backgroundColor: colors.skeleton,
    borderRadius: 4,
    marginBottom: spacing.xxs,
  },
  titleLineShort: {
    width: '60%',
    height: 14,
    backgroundColor: colors.skeleton,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  priceLine: {
    width: '50%',
    height: 14,
    backgroundColor: colors.skeleton,
    borderRadius: 4,
  },
});
