/**
 * CartScreen
 *
 * Displays cart items with quantity management and order summary.
 * Uses FlashList for performant rendering and the useCart hook for state.
 */

import React, {useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useCart} from '@hooks/useCart';
import {colors, spacing} from '@theme';
import type {CartItem} from '@apptypes/cart';
import {CartLineItem} from '@components/CartLineItem';
import {CartSummary} from '@components/CartSummary';
import {EmptyState} from '@components/EmptyState';

function ItemSeparator() {
  return <View style={styles.separator} />;
}

export function CartScreen() {
  const insets = useSafeAreaInsets();

  const {
    items,
    totalItems,
    subtotalFormatted,
    subtotalAccessibilityLabel,
    isEmpty,
    handleUpdateQuantity,
    handleRemove,
    handleContinueShopping,
  } = useCart();

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

  if (isEmpty) {
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
      <FlashList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: insets.bottom + 160 + spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      />

      <CartSummary
        totalItems={totalItems}
        subtotalFormatted={subtotalFormatted}
        subtotalAccessibilityLabel={subtotalAccessibilityLabel}
        bottomInset={insets.bottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
