/**
 * useAddToCart Hook
 *
 * Encapsulates add-to-cart logic, button state, and accessibility labels
 * for the ProductDetailScreen.
 */

import {useCallback} from 'react';
import {AccessibilityInfo} from 'react-native';
import type {Product, Variant} from '@apptypes/product';
import {useCartStore} from '@store/cartStore';
import {formatPrice, formatPriceForVoiceOver} from '@utils/currency';

interface UseAddToCartOptions {
  product: Product | undefined;
  selectedVariant: Variant | undefined;
  isPurchasable: boolean;
}

export function useAddToCart({
  product,
  selectedVariant,
  isPurchasable,
}: UseAddToCartOptions) {
  const addItem = useCartStore(s => s.addItem);

  const handleAddToCart = useCallback(() => {
    if (!product || !selectedVariant || !isPurchasable) {
      return;
    }

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productTitle: product.title,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      image: selectedVariant.image,
      selectedOptions: selectedVariant.selectedOptions,
    });

    AccessibilityInfo.announceForAccessibility('Added to cart');
  }, [product, selectedVariant, isPurchasable, addItem]);

  const buttonDisabled = !selectedVariant || !isPurchasable;

  const buttonLabel = !selectedVariant
    ? 'Select options'
    : !isPurchasable
      ? 'Currently unavailable'
      : `Add to Cart — ${formatPrice(selectedVariant.price)}`;

  const buttonAccessibilityLabel = !selectedVariant
    ? 'Select options to add to cart'
    : !isPurchasable
      ? 'This variant is currently unavailable'
      : `Add to cart for ${formatPriceForVoiceOver(selectedVariant.price)}`;

  return {
    handleAddToCart,
    buttonDisabled,
    buttonLabel,
    buttonAccessibilityLabel,
  };
}
