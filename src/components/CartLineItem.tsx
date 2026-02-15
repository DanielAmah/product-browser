/**
 * CartLineItem Component
 *
 * Renders a single item row in the shopping cart.
 * Displays thumbnail, title, variant, price, and quantity stepper.
 */

import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  AccessibilityInfo,
} from 'react-native';
import type {CartItem} from '@apptypes/cart';
import {formatPrice, formatPriceForVoiceOver} from '@utils/currency';
import {QuantityStepper} from '@components/QuantityStepper';
import {colors} from '@theme';

interface CartLineItemProps {
  item: CartItem;
  onUpdateQuantity: (variantId: string, delta: number) => void;
  onRemove: (variantId: string) => void;
}

export const CartLineItem = React.memo<CartLineItemProps>(
  ({item, onUpdateQuantity, onRemove}) => {
    const handleIncrement = useCallback(() => {
      onUpdateQuantity(item.variantId, 1);
    }, [item.variantId, onUpdateQuantity]);

    const handleDecrement = useCallback(() => {
      if (item.quantity === 1) {
        onRemove(item.variantId);
        AccessibilityInfo.announceForAccessibility(
          `${item.productTitle} removed from cart`,
        );
      } else {
        onUpdateQuantity(item.variantId, -1);
      }
    }, [
      item.variantId,
      item.quantity,
      item.productTitle,
      onUpdateQuantity,
      onRemove,
    ]);

    const lineTotal = parseFloat(item.price.amount) * item.quantity;
    const lineTotalFormatted = formatPrice({
      amount: lineTotal.toFixed(2),
      currencyCode: item.price.currencyCode,
    });

    return (
      <View
        style={styles.lineItem}
        accessibilityRole="none"
        accessibilityLabel={`${item.productTitle}, ${item.variantTitle}, quantity ${item.quantity}, ${formatPriceForVoiceOver(item.price)} each`}>
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          {item.image?.url ? (
            <Image
              source={{uri: item.image.url}}
              style={styles.thumbnail}
              resizeMode="cover"
              accessibilityLabel={item.productTitle}
            />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
          )}
        </View>

        {/* Item Details */}
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.productTitle}
          </Text>
          <Text style={styles.itemVariant} numberOfLines={1}>
            {item.variantTitle}
          </Text>

          <View style={styles.priceQuantityRow}>
            <Text style={styles.itemPrice}>{lineTotalFormatted}</Text>
            <QuantityStepper
              quantity={item.quantity}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          </View>
        </View>
      </View>
    );
  },
  (prev, next) =>
    prev.item.variantId === next.item.variantId &&
    prev.item.quantity === next.item.quantity,
);

CartLineItem.displayName = 'CartLineItem';

const styles = StyleSheet.create({
  lineItem: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.skeleton,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
    lineHeight: 20,
  },
  itemVariant: {
    fontSize: 13,
    color: colors.textTertiary,
    marginBottom: 10,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
