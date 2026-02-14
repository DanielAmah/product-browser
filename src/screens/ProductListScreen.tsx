/**
 * ProductListScreen
 *
 * Displays the product catalog in a 2-column grid.
 * Handles loading, error, empty, and offline states.
 */

import React, {useCallback, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {ProductListScreenProps} from '@navigation/types';
import {useProductStore} from '@store/productStore';
import {useNetworkStatus} from '@hooks/useNetworkStatus';
import {colors, spacing, layout, textStyles} from '@theme';
import type {Product} from '@apptypes/product';
import {formatPrice, isOnSale} from '@utils/currency';
import {OfflineBanner} from '@components/OfflineBanner';
import {LoadingSkeleton} from '@components/LoadingSkeleton';
import {EmptyState} from '@components/EmptyState';
import {ErrorState} from '@components/ErrorState';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_GAP = spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - CARD_GAP) / 2;

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

const ProductCard = React.memo<ProductCardProps>(
  ({product, onPress}) => {
    const firstImage = product.images[0];
    const minPrice = product.priceRange.minVariantPrice;
    const compareAtPrice = product.compareAtPriceRange.minVariantPrice;
    const onSale = isOnSale(compareAtPrice);

    return (
      <Pressable
        style={({pressed}) => [styles.card, pressed && styles.cardPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${product.title}, ${formatPrice(minPrice)}${onSale ? ', on sale' : ''}`}
        accessibilityHint="Double tap to view product details">
        <View style={styles.imageContainer}>
          {firstImage ? (
            <Image
              source={{uri: firstImage.url}}
              style={styles.cardImage}
              resizeMode="cover"
              accessibilityLabel={product.title}
            />
          ) : (
            <View style={[styles.cardImage, styles.imagePlaceholder]} />
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardVendor} numberOfLines={1}>
            {product.vendor}
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

export function ProductListScreen({navigation}: ProductListScreenProps) {
  const insets = useSafeAreaInsets();
  const isOnline = useNetworkStatus();

  // Granular selectors for optimal re-renders
  const products = useProductStore(s => s.products);
  const fetchState = useProductStore(s => s.fetchState);
  const error = useProductStore(s => s.error);
  const isHydrated = useProductStore(s => s.isHydrated);
  const fetchProducts = useProductStore(s => s.fetchProducts);
  const hydrateFromCache = useProductStore(s => s.hydrateFromCache);

  // Hydrate from cache on mount
  useEffect(() => {
    hydrateFromCache();
  }, [hydrateFromCache]);

  // Fetch products after hydration
  useEffect(() => {
    if (isHydrated) {
      fetchProducts();
    }
  }, [isHydrated, fetchProducts]);

  const handleRefresh = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductPress = useCallback(
    (productId: string) => {
      navigation.navigate('ProductDetail', {productId});
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({item}: {item: Product}) => (
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item.id)}
      />
    ),
    [handleProductPress],
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  // Don't render until hydrated to prevent flash of empty state
  if (!isHydrated) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Loading state (first load, no cached data)
  if (fetchState === 'loading' && products.length === 0) {
    return (
      <View style={styles.container}>
        <LoadingSkeleton />
      </View>
    );
  }

  // Error state (no cached data to show)
  if (fetchState === 'error' && products.length === 0) {
    return (
      <View style={styles.container}>
        <ErrorState message={error || 'Something went wrong'} onRetry={handleRefresh} />
      </View>
    );
  }

  // Empty state (fetch succeeded but no products)
  if (fetchState === 'success' && products.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="No products available"
          message="Check back later for new arrivals"
        />
      </View>
    );
  }

  const isRefreshing = fetchState === 'refreshing';

  return (
    <View style={styles.container}>
      {!isOnline && <OfflineBanner />}
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: insets.bottom + spacing.lg},
        ]}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4}
        windowSize={3}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
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
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.9,
  },
  imageContainer: {
    width: '100%',
    height: layout.cardImageHeight,
    backgroundColor: colors.backgroundSecondary,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: colors.skeleton,
  },
  cardContent: {
    padding: spacing.sm,
  },
  cardVendor: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xxs,
  },
  cardTitle: {
    ...textStyles.bodySmall,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardPrice: {
    ...textStyles.label,
    color: colors.textPrimary,
  },
  salePrice: {
    color: colors.sale,
  },
  compareAtPrice: {
    ...textStyles.priceStrikethrough,
    color: colors.textTertiary,
  },
});
