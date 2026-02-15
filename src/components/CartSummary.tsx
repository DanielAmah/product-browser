/**
 * CartSummary Component
 *
 * Sticky bottom panel showing subtotal, total, and checkout button.
 */

import React from 'react';
import {View, Text, StyleSheet, Pressable, Platform} from 'react-native';
import {ArrowRight} from 'lucide-react-native';
import {colors, spacing} from '@theme';

interface CartSummaryProps {
  totalItems: number;
  subtotalFormatted: string;
  subtotalAccessibilityLabel: string;
  bottomInset: number;
}

export function CartSummary({
  totalItems,
  subtotalFormatted,
  subtotalAccessibilityLabel,
  bottomInset,
}: CartSummaryProps) {
  return (
    <View
      style={[
        styles.summaryContainer,
        {paddingBottom: bottomInset || spacing.lg},
      ]}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </Text>
        <Text style={styles.summaryValue}>{subtotalFormatted}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text
          style={styles.totalValue}
          accessibilityLabel={subtotalAccessibilityLabel}>
          {subtotalFormatted}
        </Text>
      </View>
      <Pressable
        style={({pressed}) => [
          styles.checkoutButton,
          pressed && styles.checkoutButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Proceed to checkout">
        <Text style={styles.checkoutButtonText}>Checkout</Text>
        <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  checkoutButtonPressed: {
    opacity: 0.85,
    transform: [{scale: 0.985}],
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
