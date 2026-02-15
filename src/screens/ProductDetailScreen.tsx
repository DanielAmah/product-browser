/**
 * ProductDetailScreen
 *
 * Displays product details with variant selection and add to cart.
 * Composed from ProductInfo, ImageCarousel, and AddToCartButton.
 */

import React, {useCallback} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {ProductDetailScreenProps} from '@navigation/types';
import {useProductStore} from '@store/productStore';
import {useVariantSelection} from '@hooks/useVariantSelection';
import {useAddToCart} from '@hooks/useAddToCart';
import {colors, spacing, textStyles} from '@theme';
import {ImageCarousel} from '@components/ImageCarousel';
import {ProductInfo} from '@components/ProductInfo';
import {AddToCartButton} from '@components/AddToCartButton';

export function ProductDetailScreen({
  route,
}: ProductDetailScreenProps) {
  const {productId} = route.params;
  const insets = useSafeAreaInsets();

  // Stable selector — only re-renders when the specific product changes
  const product = useProductStore(
    useCallback(s => s.products.find(p => p.id === productId), [productId]),
  );

  const {
    selectedOptions,
    selectedVariant,
    isPurchasable,
    optionAvailability,
    selectOption,
  } = useVariantSelection(product);

  const {
    handleAddToCart,
    buttonDisabled,
    buttonLabel,
    buttonAccessibilityLabel,
  } = useAddToCart({product, selectedVariant, isPurchasable});

  // Image the carousel should scroll to when a variant is selected
  const focusImageId = selectedVariant?.image?.id;

  if (!product) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 100 + spacing.lg},
        ]}
        showsVerticalScrollIndicator={false}>
        <ImageCarousel
          images={product.images}
          productTitle={product.title}
          focusImageId={focusImageId}
        />

        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          selectedOptions={selectedOptions}
          optionAvailability={optionAvailability}
          onSelectOption={selectOption}
        />
      </ScrollView>

      <AddToCartButton
        label={buttonLabel}
        accessibilityLabel={buttonAccessibilityLabel}
        disabled={buttonDisabled}
        bottomInset={insets.bottom}
        onPress={handleAddToCart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  errorText: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
});
