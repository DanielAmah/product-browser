/**
 * Product API
 *
 * Handles fetching products from the JSON feed with caching.
 * Implements stale-while-revalidate pattern.
 */

import type {Product} from '@apptypes/product';
import type {CacheEntry} from '@apptypes/api';
import {NetworkError} from '@apptypes/api';
import {fetchWithRetry} from '@utils/retry';
import {getStorageItem, setStorageItem} from '@utils/storage';
import {API_CONFIG} from './config';

/**
 * Fetch products from the API
 *
 * The JSON feed returns a top-level array of Product objects.
 *
 * @throws NetworkError on failure
 */
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetchWithRetry(API_CONFIG.PRODUCTS_URL, {
    timeoutMs: API_CONFIG.FETCH_TIMEOUT_MS,
    maxRetries: API_CONFIG.MAX_RETRIES,
  });

  const data: Product[] = await response.json();
  return data;
}

/**
 * Read products from cache
 */
export async function readProductsCache(): Promise<CacheEntry<Product[]> | null> {
  const cached = await getStorageItem<CacheEntry<Product[]>>(
    API_CONFIG.PRODUCTS_CACHE_KEY,
  );

  // Validate cache version
  if (cached && cached.version !== API_CONFIG.CACHE_VERSION) {
    // Cache is from an older version, invalidate it
    return null;
  }

  return cached;
}

/**
 * Write products to cache
 */
export async function writeProductsCache(products: Product[]): Promise<void> {
  const entry: CacheEntry<Product[]> = {
    data: products,
    timestamp: Date.now(),
    version: API_CONFIG.CACHE_VERSION,
  };

  await setStorageItem(API_CONFIG.PRODUCTS_CACHE_KEY, entry);
}

/**
 * Get user-friendly error message from NetworkError
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return error.isTimeout
      ? 'Request timed out. Please check your connection.'
      : 'Unable to connect. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}
