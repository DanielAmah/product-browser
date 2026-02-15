/**
 * ProductCard Component
 *
 * Renders a single product tile in the grid.
 * Shows image, vendor, title, and price with sale badge.
 */

import React from 'react';
import {View, Text, StyleSheet, Pressable, Image, Dimensions} from 'react-native';
import type {Product} from '@apptypes/product';
import {formatPrice, isOnSale, calculateDiscountPercentage} from '@utils/currency';
import {getSquareImageUrl} from '@utils/image';
import {colors, responsive} from '@theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_GAP = 12;
const ROW_GAP = 16;
const HORIZONTAL_PADDING = 16;

export const PRODUCT_CARD_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard = React.memo<ProductCardProps>(
  ({product, onPress}) => {
    const firstImage = product.images[0];
    const imageUrl = firstImage ? getSquareImageUrl(firstImage.url) : null;
    const minPrice = product.priceRange.minVariantPrice;
    const compareAtPrice = product.compareAtPriceRange.minVariantPrice;
    const onSale = isOnSale(compareAtPrice, minPrice);
    const discountPct = onSale
      ? calculateDiscountPercentage(compareAtPrice, minPrice)
      : 0;

    return (
      <Pressable
        style={({pressed}) => [styles.card, pressed && styles.cardPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${product.title}, ${formatPrice(minPrice)}${onSale ? `, Save ${discountPct}%` : ''}`}
        accessibilityHint="Double tap to view product details">
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{uri: imageUrl}}
              style={styles.cardImage}
              resizeMode="cover"
              accessibilityLabel={product.title}
            />
          ) : (
            <View style={[styles.cardImage, styles.imagePlaceholder]} />
          )}
          {onSale && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>Save {discountPct}%</Text>
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardVendor} numberOfLines={1}>
            {product.vendor.toUpperCase()}
          </Text>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {product.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.cardPrice, onSale && styles.salePrice]}>
              {formatPrice(minPrice)}
            </Text>
            {onSale && (
              <Text style={styles.compareAtPrice}>
                {formatPrice(compareAtPrice)}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  },
  (prev, next) => prev.product.id === next.product.id,
);

ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  card: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    marginBottom: ROW_GAP,
    marginHorizontal: CARD_GAP / 2,
  },
  cardPressed: {
    opacity: 0.7,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: colors.skeleton,
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.sale,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  saleBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  cardContent: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  cardVendor: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textPrimary,
    marginBottom: 5,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardPrice: {
    fontSize: responsive(12, 16),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  salePrice: {
    color: colors.sale,
  },
  compareAtPrice: {
    fontSize: responsive(10, 14),
    fontWeight: '400',
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
});
