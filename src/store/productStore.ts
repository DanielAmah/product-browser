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
  products: Product[];
  fetchState: FetchState;
  error: string | null;
  lastFetched: number | null;
  isHydrated: boolean;

  fetchProducts: () => Promise<void>;
  hydrateFromCache: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
}

// Request deduplication
let activeRequest: Promise<void> | null = null;

/** Factory — allows fresh instances for testing. */
export const createProductStore = () =>
  create<ProductState>((set, get) => ({
    products: [],
    fetchState: 'idle',
    error: null,
    lastFetched: null,
    isHydrated: false,

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

    fetchProducts: async () => {
      if (activeRequest) {
        return activeRequest;
      }

      activeRequest = (async () => {
        const hasProducts = get().products.length > 0;

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

          writeProductsCache(products).catch(console.error);
        } catch (err) {
          const message = getErrorMessage(err);

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

    getProductById: (id: string) => {
      return get().products.find(p => p.id === id);
    },
  }));

export const useProductStore = createProductStore();
