/**
 * Badge Component
 *
 * Displays a count badge (e.g., cart item count).
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, textStyles} from '@theme';

interface BadgeProps {
  count: number;
}

export function Badge({count}: BadgeProps) {
  // Don't render if count is 0
  if (count <= 0) {
    return null;
  }

  // Format count (99+ for large numbers)
  const displayCount = count > 99 ? '99+' : String(count);

  return (
    <View
      style={styles.container}
      accessibilityLabel={`${count} items in cart`}>
      <Text style={styles.text}>{displayCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.badge,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...textStyles.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.badgeText,
  },
});
