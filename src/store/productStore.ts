/**
 * Product Store
 *
 * Zustand store for product data with caching and error handling.
 */

import {create} from 'zustand';
import type {Product} from '@apptypes/product';
import type {FetchState} from '@apptypes/api';
import {NetworkError} from '@apptypes/api';
import {
  fetchProducts as apiFetchProducts,
  readProductsCache,
  writeProductsCache,
  getErrorMessage,
} from '@api/productApi';

interface ProductState {
  // State
  products: Product[];
  fetchState: FetchState;
  error: string | null;
  lastFetched: number | null;
  isHydrated: boolean;

  // Actions
  fetchProducts: () => Promise<void>;
  hydrateFromCache: () => Promise<void>;

  // Selectors (co-located for discoverability)
  getProductById: (id: string) => Product | undefined;
}

// Request deduplication
let activeRequest: Promise<void> | null = null;

/**
 * Factory function for creating the store.
 * Allows creating fresh instances for testing.
 */
export const createProductStore = () =>
  create<ProductState>((set, get) => ({
    // Initial state
    products: [],
    fetchState: 'idle',
    error: null,
    lastFetched: null,
    isHydrated: false,

    /**
     * Hydrate products from cache on app launch.
     * This runs before the network fetch to show cached data immediately.
     */
    hydrateFromCache: async () => {
      try {
        const cached = await readProductsCache();
        if (cached && Array.isArray(cached.data) && cached.data.length > 0) {
          set({
            products: cached.data,
            lastFetched: cached.timestamp,
            isHydrated: true,
          });
        } else {
          set({isHydrated: true});
        }
      } catch (error) {
        console.error('Failed to hydrate from cache:', error);
        set({isHydrated: true});
      }
    },

    /**
     * Fetch products from the API.
     * Implements request deduplication and stale-while-revalidate.
     */
    fetchProducts: async () => {
      // Deduplicate: if a fetch is already in-flight, return the same promise
      if (activeRequest) {
        return activeRequest;
      }

      activeRequest = (async () => {
        const hasProducts = get().products.length > 0;

        // Set loading state based on whether we have cached data
        set({
          fetchState: hasProducts ? 'refreshing' : 'loading',
          error: null,
        });

        try {
          const products = await apiFetchProducts();
          const validProducts = Array.isArray(products) ? products : [];
          set({
            products: validProducts,
            fetchState: 'success',
            lastFetched: Date.now(),
          });

          // Write to cache in background
          writeProductsCache(products).catch(console.error);
        } catch (err) {
          const message = getErrorMessage(err);

          // Only set error state if we have no cached data to show
          if (get().products.length === 0) {
            set({
              fetchState: 'error',
              error: message,
            });
          } else {
            // Keep showing cached data, just update state
            set({fetchState: 'success'});
          }
        } finally {
          activeRequest = null;
        }
      })();

      return activeRequest;
    },

    /**
     * Get a product by ID.
     * Co-located selector for convenience.
     */
    getProductById: (id: string) => {
      return get().products.find(p => p.id === id);
    },
  }));

// Default singleton instance
export const useProductStore = createProductStore();
