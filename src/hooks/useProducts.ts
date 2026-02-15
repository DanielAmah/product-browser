/**
 * useProducts Hook
 *
 * Encapsulates product hydration, fetching, and client-side pagination.
 * Keeps the ProductListScreen thin and testable.
 */

import {useCallback, useEffect, useMemo, useState} from 'react';
import {useProductStore} from '@store/productStore';

/** Number of products to reveal per page */
const PAGE_SIZE = 10;

export function useProducts() {
  const products = useProductStore(s => s.products ?? []);
  const fetchState = useProductStore(s => s.fetchState);
  const error = useProductStore(s => s.error);
  const isHydrated = useProductStore(s => s.isHydrated);
  const fetchProducts = useProductStore(s => s.fetchProducts);
  const hydrateFromCache = useProductStore(s => s.hydrateFromCache);

  // --- Pagination ---
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const displayedProducts = useMemo(
    () => products.slice(0, displayCount),
    [products, displayCount],
  );
  const hasMore = displayCount < products.length;

  // Reset pagination when the underlying list changes (fresh fetch)
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [products.length]);

  // Hydrate cached data on mount
  useEffect(() => {
    hydrateFromCache();
  }, [hydrateFromCache]);

  // Fetch from network once hydration completes
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
    // Short delay keeps the UX consistent with a real paginated API
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + PAGE_SIZE, products.length));
      setIsLoadingMore(false);
    }, 300);
  }, [hasMore, isLoadingMore, products.length]);

  return {
    /** Full product array from the store */
    products,
    /** Paginated slice currently visible */
    displayedProducts,
    /** Whether more pages are available */
    hasMore,
    /** Current fetch lifecycle state */
    fetchState,
    /** Last error message (if any) */
    error,
    /** Whether the cache has been read */
    isHydrated,
    /** Whether the next page is loading */
    isLoadingMore,
    /** Whether a pull-to-refresh is active */
    isRefreshing: fetchState === 'refreshing',
    /** Pull-to-refresh handler */
    handleRefresh,
    /** Infinite-scroll handler */
    handleEndReached,
  };
}
