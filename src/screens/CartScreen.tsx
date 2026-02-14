/**
 * CartScreen
 *
 * Displays cart items with quantity management and order summary.
 */

import React, {useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
  AccessibilityInfo,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootTabParamList} from '@navigation/types';
import {
  useCartStore,
  selectSubtotal,
  selectTotalItems,
} from '@store/cartStore';
import {colors, spacing, layout, textStyles} from '@theme';
import {formatPrice, formatPriceForVoiceOver} from '@utils/currency';
import type {CartItem} from '@apptypes/cart';
import {QuantityStepper} from '@components/QuantityStepper';
import {EmptyState} from '@components/EmptyState';

interface CartLineItemProps {
  item: CartItem;
  onUpdateQuantity: (variantId: string, delta: number) => void;
  onRemove: (variantId: string) => void;
}

const CartLineItem = React.memo<CartLineItemProps>(
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
    }, [item.variantId, item.quantity, item.productTitle, onUpdateQuantity, onRemove]);

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
          <Text style={styles.itemPrice}>{lineTotalFormatted}</Text>
        </View>

        {/* Quantity Stepper */}
        <QuantityStepper
          quantity={item.quantity}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
        />
      </View>
    );
  },
  (prev, next) =>
    prev.item.variantId === next.item.variantId &&
    prev.item.quantity === next.item.quantity,
);

CartLineItem.displayName = 'CartLineItem';

export function CartScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootTabParamList>>();

  // Granular selectors
  const items = useCartStore(s => s.items);
  const subtotal = useCartStore(selectSubtotal);
  const totalItems = useCartStore(selectTotalItems);
  const updateQuantity = useCartStore(s => s.updateQuantity);
  const removeItem = useCartStore(s => s.removeItem);

  const handleUpdateQuantity = useCallback(
    (variantId: string, delta: number) => {
      updateQuantity(variantId, delta);
    },
    [updateQuantity],
  );

  const handleRemove = useCallback(
    (variantId: string) => {
      removeItem(variantId);
    },
    [removeItem],
  );

  const handleContinueShopping = useCallback(() => {
    navigation.navigate('ProductsTab', {screen: 'ProductList'});
  }, [navigation]);

  const renderItem = useCallback(
    ({item}: {item: CartItem}) => (
      <CartLineItem
        item={item}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
      />
    ),
    [handleUpdateQuantity, handleRemove],
  );

  const keyExtractor = useCallback((item: CartItem) => item.variantId, []);

  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  // Format totals
  const subtotalFormatted = formatPrice({
    amount: subtotal.toFixed(2),
    currencyCode: 'CAD',
  });

  // Empty cart state
  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Your cart is empty"
          message="Add some products to get started"
          actionLabel="Continue Shopping"
          onAction={handleContinueShopping}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: insets.bottom + 140 + spacing.lg},
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Cart Summary - Sticky Bottom */}
      <View
        style={[
          styles.summaryContainer,
          {paddingBottom: insets.bottom || spacing.lg},
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
            accessibilityLabel={`Total: ${formatPriceForVoiceOver({amount: subtotal.toFixed(2), currencyCode: 'CAD'})}`}>
            {subtotalFormatted}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  thumbnailContainer: {
    width: layout.thumbnailSize,
    height: layout.thumbnailSize,
    borderRadius: layout.buttonRadius,
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
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  itemTitle: {
    ...textStyles.bodySmall,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  itemVariant: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    ...textStyles.label,
    color: colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...textStyles.body,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    ...textStyles.h3,
    color: colors.textPrimary,
  },
  totalValue: {
    ...textStyles.h3,
    color: colors.textPrimary,
  },
});
