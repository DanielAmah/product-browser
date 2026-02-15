/**
 * Product Store Tests
 */

import {act} from '@testing-library/react-native';
import {useProductStore} from '../../store/productStore';
import type {Product} from '../../types/product';
import type {CacheEntry} from '../../types/api';

// Mock the productApi module
jest.mock('../../api/productApi', () => ({
  fetchProducts: jest.fn(),
  readProductsCache: jest.fn(),
  writeProductsCache: jest.fn(),
  getErrorMessage: jest.fn((err: unknown) => {
    if (err instanceof Error) {
      return err.message;
    }
    return 'Unknown error';
  }),
}));

import {
  fetchProducts,
  readProductsCache,
  writeProductsCache,
} from '../../api/productApi';

const mockFetchProducts = fetchProducts as jest.MockedFunction<typeof fetchProducts>;
const mockReadProductsCache = readProductsCache as jest.MockedFunction<typeof readProductsCache>;
const mockWriteProductsCache = writeProductsCache as jest.MockedFunction<typeof writeProductsCache>;

// Sample product for testing
const sampleProduct: Product = {
  id: 'p1',
  title: 'Test Product',
  description: 'A test product description',
  descriptionHtml: '<p>A test product description</p>',
  availableForSale: true,
  handle: 'test-product',
  vendor: 'Test Vendor',
  productType: 'Test Type',
  tags: ['test'],
  priceRange: {
    minVariantPrice: {amount: '28.96', currencyCode: 'CAD'},
    maxVariantPrice: {amount: '28.96', currencyCode: 'CAD'},
  },
  compareAtPriceRange: {
    minVariantPrice: {amount: '0.00', currencyCode: 'CAD'},
    maxVariantPrice: {amount: '0.00', currencyCode: 'CAD'},
  },
  options: [{id: 'opt1', name: 'Size', values: ['S', 'M', 'L']}],
  variants: [
    {
      id: 'v1',
      title: 'Size S',
      quantityAvailable: 10,
      availableForSale: true,
      currentlyNotInStock: false,
      price: {amount: '28.96', currencyCode: 'CAD'},
      compareAtPrice: null,
      sku: 'SKU-001',
      selectedOptions: [{name: 'Size', value: 'S'}],
      image: {id: 'img1', url: 'https://example.com/image.jpg'},
    },
  ],
  images: [{id: 'img1', url: 'https://example.com/image.jpg'}],
  media: [],
  collections: [],
  onlineStoreUrl: 'https://example.com/products/test-product',
};

// Reset store before each test
beforeEach(() => {
  jest.clearAllMocks();
  useProductStore.setState({
    products: [],
    fetchState: 'idle',
    error: null,
    lastFetched: null,
    isHydrated: false,
  });
});

describe('productStore', () => {
  describe('initial state', () => {
    it('has correct initial values', () => {
      const state = useProductStore.getState();
      expect(state.products).toEqual([]);
      expect(state.fetchState).toBe('idle');
      expect(state.error).toBeNull();
      expect(state.lastFetched).toBeNull();
      expect(state.isHydrated).toBe(false);
    });
  });

  describe('hydrateFromCache', () => {
    it('hydrates products from cache', async () => {
      const cachedData: CacheEntry<Product[]> = {
        data: [sampleProduct],
        timestamp: Date.now(),
        version: 1,
      };

      mockReadProductsCache.mockResolvedValueOnce(cachedData);

      await act(async () => {
        await useProductStore.getState().hydrateFromCache();
      });

      const state = useProductStore.getState();
      expect(state.products).toHaveLength(1);
      expect(state.products[0].id).toBe('p1');
      expect(state.isHydrated).toBe(true);
    });

    it('handles empty cache gracefully', async () => {
      mockReadProductsCache.mockResolvedValueOnce(null);

      await act(async () => {
        await useProductStore.getState().hydrateFromCache();
      });

      const state = useProductStore.getState();
      expect(state.products).toEqual([]);
      expect(state.isHydrated).toBe(true);
    });

    it('handles cache read error gracefully', async () => {
      mockReadProductsCache.mockRejectedValueOnce(new Error('Cache read failed'));

      await act(async () => {
        await useProductStore.getState().hydrateFromCache();
      });

      const state = useProductStore.getState();
      expect(state.products).toEqual([]);
      expect(state.isHydrated).toBe(true);
    });
  });

  describe('fetchProducts', () => {
    it('fetches and stores products successfully', async () => {
      mockFetchProducts.mockResolvedValueOnce([sampleProduct]);

      await act(async () => {
        await useProductStore.getState().fetchProducts();
      });

      const state = useProductStore.getState();
      expect(state.products).toHaveLength(1);
      expect(state.fetchState).toBe('success');
      expect(state.error).toBeNull();
      expect(state.lastFetched).not.toBeNull();
    });

    it('sets loading state during fetch', async () => {
      let loadingState: string | null = null;

      mockFetchProducts.mockImplementationOnce(async () => {
        loadingState = useProductStore.getState().fetchState;
        return [sampleProduct];
      });

      await act(async () => {
        await useProductStore.getState().fetchProducts();
      });

      expect(loadingState).toBe('loading');
    });

    it('sets refreshing state when products exist', async () => {
      // First, set some existing products
      useProductStore.setState({products: [sampleProduct]});

      let refreshingState: string | null = null;

      mockFetchProducts.mockImplementationOnce(async () => {
        refreshingState = useProductStore.getState().fetchState;
        return [sampleProduct];
      });

      await act(async () => {
        await useProductStore.getState().fetchProducts();
      });

      expect(refreshingState).toBe('refreshing');
    });

    it('handles fetch error', async () => {
      mockFetchProducts.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await useProductStore.getState().fetchProducts();
      });

      const state = useProductStore.getState();
      expect(state.fetchState).toBe('error');
      expect(state.error).toBe('Network error');
    });

    it('deduplicates concurrent requests', async () => {
      mockFetchProducts.mockResolvedValue([sampleProduct]);

      await act(async () => {
        // Fire multiple requests concurrently
        const p1 = useProductStore.getState().fetchProducts();
        const p2 = useProductStore.getState().fetchProducts();
        const p3 = useProductStore.getState().fetchProducts();
        await Promise.all([p1, p2, p3]);
      });

      // Should only call fetchProducts once due to deduplication
      expect(mockFetchProducts).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProductById', () => {
    it('returns product by id', () => {
      useProductStore.setState({products: [sampleProduct]});

      const state = useProductStore.getState();
      const product = state.getProductById('p1');
      expect(product?.id).toBe('p1');
    });

    it('returns undefined for non-existent id', () => {
      useProductStore.setState({products: [sampleProduct]});

      const state = useProductStore.getState();
      const product = state.getProductById('non-existent');
      expect(product).toBeUndefined();
    });
  });
});
