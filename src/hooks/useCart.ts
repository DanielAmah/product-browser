/**
 * useCart Hook
 *
 * Encapsulates cart store selectors, actions, and derived formatting.
 * Keeps the CartScreen thin and testable.
 */

import {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootTabParamList} from '@navigation/types';
import {
  useCartStore,
  selectSubtotal,
  selectTotalItems,
} from '@store/cartStore';
import {formatPrice, formatPriceForVoiceOver} from '@utils/currency';

export function useCart() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootTabParamList>>();

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

  // Formatted totals
  const subtotalFormatted = formatPrice({
    amount: subtotal.toFixed(2),
    currencyCode: 'CAD',
  });

  const subtotalAccessibilityLabel = `Total: ${formatPriceForVoiceOver({
    amount: subtotal.toFixed(2),
    currencyCode: 'CAD',
  })}`;

  return {
    items,
    subtotal,
    totalItems,
    subtotalFormatted,
    subtotalAccessibilityLabel,
    isEmpty: items.length === 0,
    handleUpdateQuantity,
    handleRemove,
    handleContinueShopping,
  };
}
