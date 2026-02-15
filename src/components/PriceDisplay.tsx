/**
 * PriceDisplay Component
 *
 * Displays price with optional compare-at price for sales.
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import type {Money} from '@apptypes/product';
import {formatPrice, formatPriceForVoiceOver, isOnSale, calculateDiscountPercentage} from '@utils/currency';
import {colors, spacing, textStyles, responsive} from '@theme';

interface PriceDisplayProps {
  price: Money;
  compareAtPrice: Money | null;
  size?: 'default' | 'large';
}

export function PriceDisplay({
  price,
  compareAtPrice,
  size = 'default',
}: PriceDisplayProps) {
  const onSale = isOnSale(compareAtPrice, price);

  // Build accessibility label
  const discountPct = onSale
    ? calculateDiscountPercentage(compareAtPrice!, price)
    : 0;
  const accessibilityLabel = onSale
    ? `Save ${discountPct}%: ${formatPriceForVoiceOver(price)}, was ${formatPriceForVoiceOver(compareAtPrice!)}`
    : formatPriceForVoiceOver(price);

  return (
    <View style={styles.container} accessibilityLabel={accessibilityLabel}>
      <Text
        style={[
          size === 'large' ? styles.priceLarge : styles.price,
          onSale && styles.salePrice,
        ]}>
        {formatPrice(price)}
      </Text>
      {onSale && compareAtPrice && (
        <Text style={styles.compareAtPrice}>{formatPrice(compareAtPrice)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  price: {
    ...textStyles.price,
    fontSize: responsive(16, 20),
    color: colors.textPrimary,
  },
  priceLarge: {
    ...textStyles.priceLarge,
    fontSize: responsive(22, 28),
    color: colors.textPrimary,
  },
  salePrice: {
    color: colors.sale,
  },
  compareAtPrice: {
    ...textStyles.priceStrikethrough,
    fontSize: responsive(13, 16),
    color: colors.textTertiary,
  },
});
