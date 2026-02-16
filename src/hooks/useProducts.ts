import {useCallback, useEffect, useMemo, useState} from 'react';
import {useProductStore} from '@store/productStore';

const PAGE_SIZE = 10;

export function useProducts() {
  const products = useProductStore(s => s.products ?? []);
  const fetchState = useProductStore(s => s.fetchState);
  const error = useProductStore(s => s.error);
  const isHydrated = useProductStore(s => s.isHydrated);
  const fetchProducts = useProductStore(s => s.fetchProducts);
  const hydrateFromCache = useProductStore(s => s.hydrateFromCache);

  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const displayedProducts = useMemo(
    () => products.slice(0, displayCount),
    [products, displayCount],
  );
  const hasMore = displayCount < products.length;

  // Reset to page 1 when the product list changes
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [products.length]);

  useEffect(() => {
    hydrateFromCache();
  }, [hydrateFromCache]);

  useEffect(() => {
    if (isHydrated) {
      fetchProducts();
    }
  }, [isHydrated, fetchProducts]);

  const handleRefresh = useCallback(() => {
    setDisplayCount(PAGE_SIZE);
    fetchProducts();
  }, [fetchProducts]);

  const handleEndReached = useCallback(() => {
    if (!hasMore || isLoadingMore) {
      return;
    }
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + PAGE_SIZE, products.length));
      setIsLoadingMore(false);
    }, 300);
  }, [hasMore, isLoadingMore, products.length]);

  return {
    products,
    displayedProducts,
    hasMore,
    fetchState,
    error,
    isHydrated,
    isLoadingMore,
    isRefreshing: fetchState === 'refreshing',
    handleRefresh,
    handleEndReached,
  };
}
