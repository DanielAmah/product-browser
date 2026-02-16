import {useState, useCallback, useMemo, useEffect} from 'react';
import type {Product, Variant, ProductImage} from '@apptypes/product';
import {
  findVariantByOptions,
  isVariantPurchasable,
  getOptionAvailability,
  getDefaultSelections,
} from '@utils/availability';

interface UseVariantSelectionReturn {
  selectedOptions: Record<string, string>;
  selectedVariant: Variant | undefined;
  isPurchasable: boolean;
  optionAvailability: Record<string, Record<string, boolean>>;
  displayImage: ProductImage | undefined;
  selectOption: (optionName: string, value: string) => void;
}

export function useVariantSelection(
  product: Product | undefined,
): UseVariantSelectionReturn {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => {
      if (!product) return {};
      return getDefaultSelections(product.variants, product.options);
    },
  );

  useEffect(() => {
    if (product) {
      setSelectedOptions(
        getDefaultSelections(product.variants, product.options),
      );
    }
  }, [product?.id]);

  const selectedVariant = useMemo(() => {
    if (!product) return undefined;
    return findVariantByOptions(product.variants, selectedOptions);
  }, [product, selectedOptions]);

  const isPurchasable = useMemo(
    () => isVariantPurchasable(selectedVariant),
    [selectedVariant],
  );

  const optionAvailability = useMemo(() => {
    if (!product) return {};
    return getOptionAvailability(
      product.variants,
      product.options,
      selectedOptions,
    );
  }, [product, selectedOptions]);

  const displayImage = useMemo(() => {
    if (selectedVariant?.image) {
      return selectedVariant.image;
    }
    return product?.images[0];
  }, [selectedVariant, product?.images]);

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
