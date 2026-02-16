import React, {useCallback} from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {ProductListScreenProps} from '@navigation/types';
import {useProducts} from '@hooks/useProducts';
import {useNetworkStatus} from '@hooks/useNetworkStatus';
import {colors, spacing} from '@theme';
import type {Product} from '@apptypes/product';
import {ProductCard} from '@components/ProductCard';
import {OfflineBanner} from '@components/OfflineBanner';
import {LoadingSkeleton} from '@components/LoadingSkeleton';
import {EmptyState} from '@components/EmptyState';
import {ErrorState} from '@components/ErrorState';

const HORIZONTAL_PADDING = 16;

function ListFooter({visible}: {visible: boolean}) {
  if (!visible) {
    return null;
  }
  return (
    <View style={styles.footerLoader}>
      <ActivityIndicator size="small" color={colors.textTertiary} />
    </View>
  );
}

export function ProductListScreen({navigation}: ProductListScreenProps) {
  const insets = useSafeAreaInsets();
  const isOnline = useNetworkStatus();

  const {
    products,
    displayedProducts,
    fetchState,
    error,
    isHydrated,
    isLoadingMore,
    isRefreshing,
    handleRefresh,
    handleEndReached,
  } = useProducts();

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

  if (!isHydrated) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (fetchState === 'loading' && products.length === 0) {
    return (
      <View style={styles.container}>
        <LoadingSkeleton />
      </View>
    );
  }

  if (fetchState === 'error' && products.length === 0) {
    return (
      <View style={styles.container}>
        <ErrorState
          message={error || 'Something went wrong'}
          onRetry={handleRefresh}
        />
      </View>
    );
  }

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

  return (
    <View style={styles.container}>
      {!isOnline && <OfflineBanner />}
      <FlashList
        data={displayedProducts}
        numColumns={2}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING - 6,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={<ListFooter visible={isLoadingMore} />}
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
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
