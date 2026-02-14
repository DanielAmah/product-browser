/**
 * ProductDetailScreen
 *
 * Displays product details with variant selection and add to cart functionality.
 */

import React, {useCallback, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {ProductDetailScreenProps} from '@navigation/types';
import {useProductStore} from '@store/productStore';
import {useCartStore} from '@store/cartStore';
import {useVariantSelection} from '@hooks/useVariantSelection';
import {colors, spacing, layout, textStyles} from '@theme';
import {formatPrice, formatPriceForVoiceOver, isOnSale} from '@utils/currency';
import {VariantSelector} from '@components/VariantSelector';
import {ImageCarousel} from '@components/ImageCarousel';
import {PriceDisplay} from '@components/PriceDisplay';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export function ProductDetailScreen({
  route,
  navigation,
}: ProductDetailScreenProps) {
  const {productId} = route.params;
  const insets = useSafeAreaInsets();

  // Get product from store
  const product = useProductStore(s => s.getProductById(productId));
  const addItem = useCartStore(s => s.addItem);

  // Variant selection hook
  const {
    selectedOptions,
    selectedVariant,
    isPurchasable,
    optionAvailability,
    displayImage,
    selectOption,
  } = useVariantSelection(product);

  // Memoized images for carousel
  const carouselImages = useMemo(() => {
    if (!product) return [];
    // If we have a selected variant image, show it first
    if (selectedVariant?.image) {
      const variantImageId = selectedVariant.image.id;
      const otherImages = product.images.filter(img => img.id !== variantImageId);
      return [selectedVariant.image, ...otherImages];
    }
    return product.images;
  }, [product, selectedVariant]);

  const handleAddToCart = useCallback(() => {
    if (!product || !selectedVariant || !isPurchasable) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productTitle: product.title,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      image: selectedVariant.image,
      selectedOptions: selectedVariant.selectedOptions,
    });

    // Announce for accessibility
    AccessibilityInfo.announceForAccessibility('Added to cart');
  }, [product, selectedVariant, isPurchasable, addItem]);

  const handleGoToCart = useCallback(() => {
    navigation.navigate('CartTab', {screen: 'Cart'});
  }, [navigation]);

  if (!product) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  // Determine button state
  const buttonDisabled = !selectedVariant || !isPurchasable;
  const buttonText = !selectedVariant
    ? 'Select options'
    : !isPurchasable
      ? 'Currently unavailable'
      : `Add to Cart — ${formatPrice(selectedVariant.price)}`;

  const buttonAccessibilityLabel = !selectedVariant
    ? 'Select options to add to cart'
    : !isPurchasable
      ? 'This variant is currently unavailable'
      : `Add to cart for ${formatPriceForVoiceOver(selectedVariant.price)}`;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 80 + spacing.lg},
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <ImageCarousel images={carouselImages} productTitle={product.title} />

        {/* Product Info */}
        <View style={styles.content}>
          {/* Vendor */}
          <Text style={styles.vendor}>{product.vendor}</Text>

          {/* Title */}
          <Text style={styles.title} accessibilityRole="header">
            {product.title}
          </Text>

          {/* Price */}
          {selectedVariant && (
            <PriceDisplay
              price={selectedVariant.price}
              compareAtPrice={selectedVariant.compareAtPrice}
              size="large"
            />
          )}

          {/* Variant Selector */}
          <View style={styles.variantSection}>
            <VariantSelector
              options={product.options}
              selectedOptions={selectedOptions}
              optionAvailability={optionAvailability}
              onSelectOption={selectOption}
            />
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Add to Cart Button */}
      <View
        style={[styles.buttonContainer, {paddingBottom: insets.bottom || spacing.lg}]}>
        <Pressable
          style={({pressed}) => [
            styles.addToCartButton,
            buttonDisabled && styles.buttonDisabled,
            pressed && !buttonDisabled && styles.buttonPressed,
          ]}
          onPress={handleAddToCart}
          disabled={buttonDisabled}
          accessibilityRole="button"
          accessibilityLabel={buttonAccessibilityLabel}
          accessibilityState={{disabled: buttonDisabled}}>
          <Text
            style={[
              styles.buttonText,
              buttonDisabled && styles.buttonTextDisabled,
            ]}>
            {buttonText}
          </Text>
        </Pressable>
      </View>
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
  content: {
    padding: spacing.lg,
  },
  vendor: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  title: {
    ...textStyles.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  variantSection: {
    marginTop: spacing.xl,
  },
  descriptionSection: {
    marginTop: spacing.xxl,
  },
  descriptionTitle: {
    ...textStyles.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    ...textStyles.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addToCartButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: layout.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    ...textStyles.button,
    color: colors.textInverse,
  },
  buttonTextDisabled: {
    color: colors.textDisabled,
  },
  errorText: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
});
