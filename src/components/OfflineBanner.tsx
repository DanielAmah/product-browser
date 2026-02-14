/**
 * OfflineBanner Component
 *
 * Displays a banner when the device is offline.
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, spacing, textStyles} from '@theme';

export function OfflineBanner() {
  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLabel="You are offline. Showing cached data.">
      <Text style={styles.text}>You're offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.warning,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  text: {
    ...textStyles.labelSmall,
    color: colors.textPrimary,
  },
});
