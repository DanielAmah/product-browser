/**
 * useVariantSelection Hook
 *
 * Manages variant selection state and derived values.
 */

import {useState, useCallback, useMemo, useEffect} from 'react';
import type {Product, Variant, ProductImage} from '@apptypes/product';
import {
  findVariantByOptions,
  isVariantPurchasable,
  getOptionAvailability,
  getDefaultSelections,
} from '@utils/availability';

interface UseVariantSelectionReturn {
  /** Current selections: { "Color": "Black", "Size": "S" } */
  selectedOptions: Record<string, string>;

  /** The resolved variant (or undefined if combination doesn't exist) */
  selectedVariant: Variant | undefined;

  /** Is the current selection purchasable? */
  isPurchasable: boolean;

  /**
   * For each option name, which values are available given other selections?
   * Used to dim unavailable pills: { "Size": { "S": true, "M": true, "L": false } }
   */
  optionAvailability: Record<string, Record<string, boolean>>;

  /** The image to display (from selected variant, or first product image as fallback) */
  displayImage: ProductImage | undefined;

  /** Action: user taps an option pill */
  selectOption: (optionName: string, value: string) => void;
}

/**
 * Hook for managing variant selection state.
 *
 * @param product - The product to select variants for
 * @returns Variant selection state and actions
 */
export function useVariantSelection(
  product: Product | undefined,
): UseVariantSelectionReturn {
  // Initialize with default selections
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => {
      if (!product) return {};
      return getDefaultSelections(product.variants, product.options);
    },
  );

  // Reset selections when product changes
  useEffect(() => {
    if (product) {
      setSelectedOptions(
        getDefaultSelections(product.variants, product.options),
      );
    }
  }, [product?.id]);

  // Find the variant matching current selections
  const selectedVariant = useMemo(() => {
    if (!product) return undefined;
    return findVariantByOptions(product.variants, selectedOptions);
  }, [product, selectedOptions]);

  // Check if current selection is purchasable
  const isPurchasable = useMemo(
    () => isVariantPurchasable(selectedVariant),
    [selectedVariant],
  );

  // Calculate availability for all option values
  const optionAvailability = useMemo(() => {
    if (!product) return {};
    return getOptionAvailability(
      product.variants,
      product.options,
      selectedOptions,
    );
  }, [product, selectedOptions]);

  // Determine which image to display
  const displayImage = useMemo(() => {
    if (selectedVariant?.image) {
      return selectedVariant.image;
    }
    return product?.images[0];
  }, [selectedVariant, product?.images]);

  // Handle option selection
  const selectOption = useCallback((optionName: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value,
    }));
  }, []);

  return {
    selectedOptions,
    selectedVariant,
    isPurchasable,
    optionAvailability,
    displayImage,
    selectOption,
  };
}
